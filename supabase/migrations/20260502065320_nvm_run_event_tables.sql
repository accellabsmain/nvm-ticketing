/*
  # NVM RUN Event Database Schema

  ## Summary
  Creates the core tables for the NVM RUN half-marathon event platform.

  ## New Tables

  ### runners
  - Stores all registered participants (both physical and virtual).
  - Fields: id, full_name, email, phone, wave, bib_number, registered_at, payment_status

  ### tickets
  - Anti-counterfeit tickets tied to runners.
  - Stores HMAC signature, nonce, used_at for one-time-use enforcement.

  ### ticket_scans
  - Audit log for every QR scan attempt at entry gates.

  ### virtual_sessions
  - GPS run data for virtual division participants.

  ### run_splits
  - Per-kilometer split data for virtual sessions.

  ## Security
  - RLS enabled on all tables.
  - Authenticated users can only read their own data.
  - Only service_role can insert/update runners, tickets, and scans.
*/

-- ================================================================
-- RUNNERS
-- ================================================================
CREATE TABLE IF NOT EXISTS runners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT DEFAULT '',
  wave            TEXT NOT NULL DEFAULT 'B'
    CHECK (wave IN ('A', 'B', 'C', 'VIRTUAL')),
  bib_number      TEXT UNIQUE,
  registered_at   TIMESTAMPTZ DEFAULT now(),
  payment_status  TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Runners can read own data"
  ON runners FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert runners"
  ON runners FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update runners"
  ON runners FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- TICKETS
-- ================================================================
CREATE TABLE IF NOT EXISTS tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code     TEXT UNIQUE NOT NULL,
  runner_id       UUID REFERENCES runners(id) ON DELETE CASCADE,
  event_id        TEXT NOT NULL DEFAULT 'NVM-HM-2025-08-17',
  wave            TEXT NOT NULL,
  hmac_signature  TEXT NOT NULL,
  nonce           TEXT NOT NULL,
  issued_at       TIMESTAMPTZ DEFAULT now(),
  used_at         TIMESTAMPTZ,
  used_gate       TEXT,
  is_valid        BOOLEAN DEFAULT true
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Runners can view own ticket"
  ON tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM runners
      WHERE runners.id = tickets.runner_id
      AND runners.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert tickets"
  ON tickets FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update tickets"
  ON tickets FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- TICKET SCANS (audit log)
-- ================================================================
CREATE TABLE IF NOT EXISTS ticket_scans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code  TEXT NOT NULL,
  scanner_id   TEXT NOT NULL,
  scanned_at   TIMESTAMPTZ DEFAULT now(),
  outcome      TEXT NOT NULL
    CHECK (outcome IN ('valid', 'invalid', 'already_used', 'expired')),
  ip_address   TEXT DEFAULT '',
  metadata     JSONB DEFAULT '{}'
);

ALTER TABLE ticket_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert scans"
  ON ticket_scans FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select scans"
  ON ticket_scans FOR SELECT
  TO service_role
  USING (true);

-- ================================================================
-- VIRTUAL SESSIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS virtual_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id             UUID REFERENCES runners(id) ON DELETE CASCADE,
  ticket_code           TEXT REFERENCES tickets(ticket_code) ON DELETE SET NULL,
  event_id              TEXT NOT NULL DEFAULT 'NVM-HM-2025-08-17',
  started_at            TIMESTAMPTZ NOT NULL,
  finished_at           TIMESTAMPTZ,
  total_distance_km     NUMERIC(6,3) DEFAULT 0,
  total_duration_sec    INTEGER DEFAULT 0,
  avg_pace_sec_per_km   INTEGER DEFAULT 0,
  avg_heart_rate        INTEGER,
  elevation_gain_m      NUMERIC(7,1) DEFAULT 0,
  elevation_loss_m      NUMERIC(7,1) DEFAULT 0,
  data_hash             TEXT NOT NULL DEFAULT '',
  submitted_at          TIMESTAMPTZ DEFAULT now(),
  validation_status     TEXT DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'valid', 'flagged', 'rejected')),
  rejection_reason      TEXT DEFAULT ''
);

ALTER TABLE virtual_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Runners can view own sessions"
  ON virtual_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM runners
      WHERE runners.id = virtual_sessions.runner_id
      AND runners.user_id = auth.uid()
    )
  );

CREATE POLICY "Runners can insert own sessions"
  ON virtual_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM runners
      WHERE runners.id = virtual_sessions.runner_id
      AND runners.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sessions"
  ON virtual_sessions FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update sessions"
  ON virtual_sessions FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- RUN SPLITS
-- ================================================================
CREATE TABLE IF NOT EXISTS run_splits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES virtual_sessions(id) ON DELETE CASCADE,
  km_marker           SMALLINT NOT NULL,
  split_time_sec      INTEGER NOT NULL,
  pace_sec_per_km     INTEGER NOT NULL,
  avg_hr              SMALLINT,
  elevation_change_m  NUMERIC(6,1) DEFAULT 0,
  latitude            NUMERIC(10,7),
  longitude           NUMERIC(10,7),
  captured_at         TIMESTAMPTZ NOT NULL
);

ALTER TABLE run_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Runners can view own splits"
  ON run_splits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM virtual_sessions vs
      JOIN runners r ON r.id = vs.runner_id
      WHERE vs.id = run_splits.session_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Runners can insert own splits"
  ON run_splits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM virtual_sessions vs
      JOIN runners r ON r.id = vs.runner_id
      WHERE vs.id = run_splits.session_id
      AND r.user_id = auth.uid()
    )
  );

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_runners_email ON runners(email);
CREATE INDEX IF NOT EXISTS idx_runners_user_id ON runners(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_runner_id ON tickets(runner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_used_at ON tickets(used_at);
CREATE INDEX IF NOT EXISTS idx_ticket_scans_code ON ticket_scans(ticket_code);
CREATE INDEX IF NOT EXISTS idx_virtual_sessions_runner ON virtual_sessions(runner_id);
CREATE INDEX IF NOT EXISTS idx_virtual_sessions_status ON virtual_sessions(validation_status);
CREATE INDEX IF NOT EXISTS idx_run_splits_session ON run_splits(session_id);
