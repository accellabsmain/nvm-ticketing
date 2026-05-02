# NVM RUN — Secure Ticket Verification Schema

## Overview

Every ticket issued by NVM RUN uses cryptographic signing to prevent counterfeiting. The verification pipeline runs in under 200ms and supports both QR code scanning at entry gates and manual code entry.

---

## 1. Ticket Data Structure

```typescript
interface NvmTicket {
  // Publicly visible on QR / printed ticket
  ticket_id: string        // e.g. "NVM-2025-JKRT-00842"
  runner_id: string        // UUID of the registered runner
  event_id: string         // e.g. "NVM-HM-2025-08-17"
  wave: "A" | "B" | "C" | "VIRTUAL"
  bib_number: string       // e.g. "#00842"
  issued_at: string        // ISO 8601 UTC timestamp

  // Anti-counterfeit
  hmac_signature: string   // HMAC-SHA256(secret_key, canonical_payload)
  nonce: string            // 16-byte random hex, unique per ticket
}
```

---

## 2. HMAC Signature Generation

The canonical payload is a deterministic string concatenation:

```
canonical_payload = ticket_id + "|" + runner_id + "|" + event_id + "|" + wave + "|" + nonce + "|" + issued_at
```

Signature:
```
hmac_signature = HMAC-SHA256(EVENT_SECRET_KEY, canonical_payload)
```

- `EVENT_SECRET_KEY` is stored only on the server and never exposed to clients.
- The QR code embeds the full `NvmTicket` JSON (minus the secret key, of course).
- Verification recalculates the HMAC from the QR payload and compares via constant-time comparison.

---

## 3. Database Schema (Supabase / PostgreSQL)

```sql
-- Runners / Registrations
CREATE TABLE runners (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  phone          TEXT,
  wave           TEXT NOT NULL CHECK (wave IN ('A','B','C','VIRTUAL')),
  bib_number     TEXT UNIQUE,
  registered_at  TIMESTAMPTZ DEFAULT now(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded'))
);

-- Tickets
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code     TEXT UNIQUE NOT NULL,  -- "NVM-2025-JKRT-00842"
  runner_id       UUID REFERENCES runners(id) ON DELETE CASCADE,
  event_id        TEXT NOT NULL,
  wave            TEXT NOT NULL,
  hmac_signature  TEXT NOT NULL,
  nonce           TEXT NOT NULL,
  issued_at       TIMESTAMPTZ DEFAULT now(),
  used_at         TIMESTAMPTZ,            -- NULL = not used
  used_gate       TEXT,                   -- which gate/scanner ID used it
  is_valid        BOOLEAN DEFAULT true
);

-- Audit log for every scan attempt
CREATE TABLE ticket_scans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT NOT NULL,
  scanner_id  TEXT NOT NULL,
  scanned_at  TIMESTAMPTZ DEFAULT now(),
  outcome     TEXT NOT NULL CHECK (outcome IN ('valid','invalid','already_used','expired')),
  ip_address  TEXT,
  metadata    JSONB
);
```

---

## 4. Verification API Endpoint

```
POST /api/verify-ticket
Authorization: Bearer <GATE_SCANNER_API_KEY>
Content-Type: application/json

{
  "ticket_code": "NVM-2025-JKRT-00842",
  "qr_payload": "<full QR JSON string>",
  "scanner_id": "GATE-01"
}
```

### Response (valid):
```json
{
  "status": "valid",
  "runner": {
    "name": "Budi Santoso",
    "bib": "#00842",
    "wave": "B"
  },
  "ticket": {
    "ticket_code": "NVM-2025-JKRT-00842",
    "issued_at": "2025-07-01T10:00:00Z"
  }
}
```

### Response (already used):
```json
{
  "status": "already_used",
  "used_at": "2025-08-17T04:52:11Z",
  "used_gate": "GATE-01",
  "message": "This ticket has already been scanned."
}
```

### Response (invalid signature):
```json
{
  "status": "invalid",
  "reason": "signature_mismatch",
  "message": "Ticket signature is invalid. Possible counterfeit."
}
```

---

## 5. Verification Pipeline (Server-Side)

```
1. Parse QR payload JSON
2. Look up ticket_code in tickets table
   ├─ NOT FOUND → return "invalid" (reason: not_registered)
   └─ FOUND → continue

3. Check is_valid flag
   └─ false → return "invalid" (reason: manually_invalidated)

4. Recalculate HMAC-SHA256 from payload fields + EVENT_SECRET_KEY
   └─ mismatch → return "invalid" (reason: signature_mismatch), log scan

5. Check used_at
   └─ NOT NULL → return "already_used"

6. Mark ticket as used: SET used_at = now(), used_gate = scanner_id
7. Insert audit row into ticket_scans
8. Return "valid" with runner details
```

All steps 6-8 run inside a **single transaction** to prevent race conditions
(e.g. two gates scanning the same ticket simultaneously).

---

## 6. QR Code Format

The QR code encodes a compact JSON payload, Base64URL-encoded:

```
nvmrun://verify?d=BASE64URL(JSON.stringify(NvmTicket))
```

Human-readable fallback code printed below QR:
```
NVM-2025-JKRT-00842
```

---

## 7. Security Considerations

| Threat | Mitigation |
|--------|-----------|
| Counterfeit QR copy | HMAC-SHA256 signature — can't forge without secret key |
| Screenshot sharing | One-time use: `used_at` set on first scan |
| Race condition (double-scan) | DB transaction with `SELECT FOR UPDATE` on ticket row |
| Gate scanner compromise | Per-scanner API keys with limited scope; rotate after event |
| Replay attack | Nonce is unique per ticket; nonce reuse checked on server |
| Brute-force ticket codes | Rate limiting on verify endpoint (10 req/min per IP) |

---

## 8. Ticket Lifecycle

```
Registration Paid
     │
     ▼
Ticket Issued (hmac_signature generated server-side)
     │
     ▼
Email Sent with QR PDF
     │
     ▼
Race Day → Gate Scanner reads QR
     │
     ├─ Valid + not used ──► GRANT ENTRY → mark used_at
     ├─ Already used ──────► DENY (show used_at timestamp)
     └─ Invalid signature ─► DENY (escalate to staff)
```

---

## 9. Environment Variables Required

```env
EVENT_SECRET_KEY=<64-char random hex>    # HMAC signing key
GATE_API_KEY_GATE_01=<random>            # Per-gate scanner key
GATE_API_KEY_GATE_02=<random>
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<key>
```
