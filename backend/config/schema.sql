-- ============================================================
-- NCPL Alumni Connect – Supabase / PostgreSQL Schema
-- Run this in your Supabase project's SQL editor.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  password   TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'trainee'
               CHECK (role IN ('trainee', 'alumni', 'admin')),
  batch      TEXT,
  domain     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── alumni ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alumni (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           TEXT        NOT NULL,
  email               TEXT        NOT NULL UNIQUE,
  company             TEXT        NOT NULL,
  job_role            TEXT        NOT NULL,
  technologies        TEXT[]      NOT NULL DEFAULT '{}',
  years_of_experience INTEGER     NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  linkedin_profile    TEXT        DEFAULT '',
  availability_status TEXT        NOT NULL DEFAULT 'available'
                        CHECK (availability_status IN ('available', 'busy', 'not_available')),
  profile_photo       TEXT        DEFAULT '',
  batch               TEXT,
  location            TEXT,
  bio                 TEXT,
  domain              TEXT,
  avatar_initials     TEXT,
  avatar_color        TEXT        DEFAULT '#1A3C6E',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── referral_requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_requests (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id            UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  alumni_id               UUID        NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
  request_type            TEXT        NOT NULL CHECK (request_type IN ('referral', 'reference')),
  target_job_role         TEXT        NOT NULL,
  target_company          TEXT        NOT NULL,
  job_description_url     TEXT,
  resume_url              TEXT        NOT NULL,
  resume_path             TEXT,
  linkedin_url            TEXT,
  portfolio_url           TEXT,
  personal_message        TEXT        NOT NULL,
  status                  TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed')),
  alumni_response         TEXT,
  additional_info_request TEXT,
  status_history          JSONB       NOT NULL DEFAULT '[]',
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alumni_technologies   ON alumni USING GIN (technologies);
CREATE INDEX IF NOT EXISTS idx_alumni_company        ON alumni (company);
CREATE INDEX IF NOT EXISTS idx_alumni_job_role       ON alumni (job_role);
CREATE INDEX IF NOT EXISTS idx_alumni_years_exp      ON alumni (years_of_experience);
CREATE INDEX IF NOT EXISTS idx_alumni_availability   ON alumni (availability_status);

CREATE INDEX IF NOT EXISTS idx_referral_candidate    ON referral_requests (candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_alumni       ON referral_requests (alumni_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_status       ON referral_requests (status);

-- ── updated_at auto-maintenance ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER alumni_updated_at
  BEFORE UPDATE ON alumni
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER referral_requests_updated_at
  BEFORE UPDATE ON referral_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Storage bucket (run via Supabase dashboard or use the Storage API) ─────────
-- Create a bucket named "resumes" with public access for PDF resume downloads.
-- You can also create it programmatically via the Supabase Storage API.
