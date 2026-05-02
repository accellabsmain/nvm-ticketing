# NVM RUN — Virtual Run Tracking & Pace/Distance Schema

## Overview

The Virtual Run division allows participants to run their 21.1km anywhere in the world during the official event window (17-24 August 2025). GPS data is collected via the NVM RUN web/mobile app, cryptographically sealed, then submitted for leaderboard validation.

---

## 1. Run Session Data Structure

```typescript
interface RunSession {
  session_id: string       // UUID
  runner_id: string        // UUID of registered virtual runner
  ticket_code: string      // Used to tie session to verified registration
  event_id: string         // "NVM-HM-2025-08-17"
  
  started_at: string       // ISO 8601 UTC
  finished_at: string | null
  
  // Aggregated stats (computed server-side from waypoints)
  total_distance_km: number        // e.g. 21.14
  total_duration_seconds: number   // e.g. 7234
  avg_pace_sec_per_km: number      // e.g. 343 (~5:43/km)
  avg_heart_rate: number | null
  elevation_gain_m: number
  elevation_loss_m: number
  
  // Raw GPS track
  waypoints: Waypoint[]
  
  // Anti-cheat
  data_hash: string        // SHA-256 of canonical waypoints JSON
  submitted_at: string
  validation_status: "pending" | "valid" | "flagged" | "rejected"
}

interface Waypoint {
  ts: number           // Unix timestamp (milliseconds)
  lat: number          // Latitude
  lng: number          // Longitude
  alt: number          // Altitude in meters (GPS or barometric)
  speed: number        // m/s (raw from GPS)
  accuracy: number     // GPS accuracy in meters
  hr: number | null    // Heart rate (bpm) if connected device
}
```

---

## 2. Split Tracking

Splits are auto-captured every 1km. Stored separately for analysis:

```typescript
interface Split {
  session_id: string
  km_marker: number        // 1, 2, 3, ... 21
  split_time_seconds: number    // time taken for this 1km segment
  pace_sec_per_km: number       // same as split_time for 1km splits
  avg_hr: number | null
  elevation_change_m: number
  latitude: number
  longitude: number
  captured_at: string      // ISO 8601 UTC
}
```

---

## 3. Database Schema (PostgreSQL / Supabase)

```sql
-- Virtual run sessions
CREATE TABLE virtual_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id             UUID REFERENCES runners(id) ON DELETE CASCADE,
  ticket_code           TEXT REFERENCES tickets(ticket_code),
  event_id              TEXT NOT NULL,
  started_at            TIMESTAMPTZ NOT NULL,
  finished_at           TIMESTAMPTZ,
  total_distance_km     NUMERIC(6,3),
  total_duration_sec    INTEGER,
  avg_pace_sec_per_km   INTEGER,
  avg_heart_rate        INTEGER,
  elevation_gain_m      NUMERIC(7,1),
  elevation_loss_m      NUMERIC(7,1),
  data_hash             TEXT NOT NULL,
  submitted_at          TIMESTAMPTZ DEFAULT now(),
  validation_status     TEXT DEFAULT 'pending'
    CHECK (validation_status IN ('pending','valid','flagged','rejected')),
  rejection_reason      TEXT
);

-- GPS waypoints (high-frequency, stored compressed)
CREATE TABLE run_waypoints (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id  UUID REFERENCES virtual_sessions(id) ON DELETE CASCADE,
  ts          TIMESTAMPTZ NOT NULL,
  lat         NUMERIC(10,7) NOT NULL,
  lng         NUMERIC(10,7) NOT NULL,
  alt         NUMERIC(7,1),
  speed_ms    NUMERIC(5,2),
  accuracy_m  NUMERIC(5,1),
  hr          SMALLINT
);

-- 1km splits
CREATE TABLE run_splits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES virtual_sessions(id) ON DELETE CASCADE,
  km_marker           SMALLINT NOT NULL,
  split_time_sec      INTEGER NOT NULL,
  pace_sec_per_km     INTEGER NOT NULL,
  avg_hr              SMALLINT,
  elevation_change_m  NUMERIC(6,1),
  latitude            NUMERIC(10,7),
  longitude           NUMERIC(10,7),
  captured_at         TIMESTAMPTZ NOT NULL
);

-- Virtual leaderboard view
CREATE VIEW virtual_leaderboard AS
SELECT
  r.full_name,
  r.bib_number,
  vs.total_distance_km,
  vs.total_duration_sec,
  vs.avg_pace_sec_per_km,
  vs.finished_at,
  RANK() OVER (ORDER BY vs.total_duration_sec ASC) AS rank
FROM virtual_sessions vs
JOIN runners r ON r.id = vs.runner_id
WHERE vs.validation_status = 'valid'
  AND vs.total_distance_km >= 21.0
ORDER BY vs.total_duration_sec ASC;
```

---

## 4. Pace Calculation Algorithm

```typescript
function calculateCurrentPace(waypoints: Waypoint[], windowMeters = 500): number {
  // Rolling 500m window to smooth out GPS noise
  const recent = getLastNMeters(waypoints, windowMeters)
  if (recent.length < 2) return 0

  const distanceKm = haversineDistance(recent[0], recent[recent.length - 1])
  const durationSec = (recent[recent.length - 1].ts - recent[0].ts) / 1000

  if (distanceKm === 0) return 0
  return durationSec / distanceKm  // seconds per km
}

function haversineDistance(a: Waypoint, b: Waypoint): number {
  const R = 6371 // Earth radius km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x = Math.sin(dLat/2) ** 2
         + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat))
         * Math.sin(dLng/2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
```

---

## 5. Pace Zones

| Zone | Name | Pace Range (min/km) | Color |
|------|------|---------------------|-------|
| 1 | Very Easy / Recovery | > 7:00 | Gray |
| 2 | Easy | 6:00 – 7:00 | Blue |
| 3 | Aerobic / Steady | 5:30 – 6:00 | Green |
| 4 | Tempo | 4:45 – 5:30 | Amber/Orange |
| 5 | Race Effort | 4:00 – 4:45 | Red-Orange |
| 6 | Sprint | < 4:00 | Red |

---

## 6. GPS Submission API

```
POST /api/virtual-run/submit
Authorization: Bearer <RUNNER_JWT>
Content-Type: application/json

{
  "session_id": "uuid",
  "ticket_code": "NVM-2025-JKRT-00842",
  "started_at": "2025-08-17T06:30:00Z",
  "finished_at": "2025-08-17T08:07:14Z",
  "waypoints": [ { "ts": 1755391800000, "lat": -6.218, "lng": 106.802, "alt": 12.5, "speed_ms": 2.8, "accuracy_m": 4.2, "hr": 152 }, ... ],
  "data_hash": "sha256-of-waypoints-json"
}
```

Server validates:
1. Ticket exists and belongs to runner (from JWT)
2. SHA-256 of received waypoints matches `data_hash`
3. Run window is within official event dates (17–24 Aug 2025)
4. Distance >= 21.0km (calculated from waypoints)
5. Anti-cheat checks (see section 7)

---

## 7. Anti-Cheat Validation Rules

| Check | Method |
|-------|--------|
| Distance fraud | Recalculate total distance from waypoints server-side |
| Speed cheating | Flag any instant > 8 m/s (~4:10/km sustained for 30s) |
| GPS gap | Flag sessions with gaps > 5 minutes between waypoints |
| Accuracy | Filter out waypoints with GPS accuracy > 50m |
| Route plausibility | Elevation profile must match known terrain (optional ML layer) |
| Duplicate submission | One valid session per ticket per event |
| Time verification | started_at and finished_at must be within event window |

Flagged sessions go to manual review by event staff before leaderboard inclusion.

---

## 8. Frontend Tracking Flow

```
[Browser/PWA]
      │
      ▼
navigator.geolocation.watchPosition()   ← Real-time GPS
      │
      ├── Every 3 seconds: append Waypoint to local buffer
      ├── Calculate distance via haversine (cumulative)
      ├── Calculate rolling 500m pace
      ├── Check 1km split triggers → auto-capture split
      └── Sync to IndexedDB (offline resilience)

[On Finish / Submit]
      │
      ├── Compute SHA-256 of full waypoints array
      ├── POST to /api/virtual-run/submit
      └── Display result + leaderboard position
```

---

## 9. Leaderboard Schema

```typescript
interface LeaderboardEntry {
  rank: number
  runner_name: string
  bib_number: string
  finish_time: string         // "HH:MM:SS"
  avg_pace: string            // "M:SS /km"
  total_distance_km: number
  verified: boolean           // passed anti-cheat
}
```

---

## 10. Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<key>
RUNNER_JWT_SECRET=<64-char hex>
VIRTUAL_RUN_WINDOW_START=2025-08-17T00:00:00Z
VIRTUAL_RUN_WINDOW_END=2025-08-24T23:59:59Z
```
