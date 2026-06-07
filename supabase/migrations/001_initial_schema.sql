-- =============================================================================
-- 001_initial_schema.sql
-- AI Skill Mentor – Initial Database Schema
-- Run order: 001 → 002 → 003
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER: auto-update updated_at trigger function (shared across tables)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- TABLE: users
-- Extends Supabase auth.users. id MUST match auth.users.id (set on sign-up).
-- Stores the role and creation timestamp for every platform user.
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        UNIQUE NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('job_seeker', 'recruiter')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE users IS
  'Platform user registry – extends auth.users; id must match auth.users.id.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =============================================================================
-- TABLE: user_profiles
-- One-to-one extension of users with CV, location, skill data, and Storage URL.
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT,
  phone         TEXT,
  location      TEXT,
  current_title TEXT,
  skills        TEXT[],          -- canonical skill IDs from M2
  raw_skills    TEXT[],          -- as extracted by M1 NLP pipeline
  cv_url        TEXT,            -- Supabase Storage public/signed URL
  extracted_at  TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE user_profiles IS
  'Extended job-seeker profile including CV storage URL and canonical skill IDs.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);

-- Trigger: keep updated_at current on every UPDATE
CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: skill_gaps
-- Stores M2/M3 output for a job-seeker vs. a job title.
-- No UPDATE/DELETE allowed at app level (append-only audit trail).
-- =============================================================================
CREATE TABLE IF NOT EXISTS skill_gaps (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title       TEXT    NOT NULL,
  missing_skills  TEXT[],
  matched_skills  TEXT[],
  readiness_score FLOAT   CHECK (readiness_score >= 0 AND readiness_score <= 100),
  gap_details     JSONB,          -- full M3 microservice output
  created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE skill_gaps IS
  'Append-only skill-gap analysis results produced by M2/M3 per job-title request.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id   ON skill_gaps (user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_job_title ON skill_gaps (job_title);

-- =============================================================================
-- TABLE: course_recommendations
-- M4/M5 course picks per skill gap; includes explainability text from M5.
-- =============================================================================
CREATE TABLE IF NOT EXISTS course_recommendations (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id       UUID    NOT NULL REFERENCES skill_gaps(id) ON DELETE CASCADE,
  user_id      UUID    NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  skill        TEXT    NOT NULL,
  course_title TEXT    NOT NULL,
  platform     TEXT    CHECK (platform IN ('udemy', 'coursera')),
  url          TEXT,
  match_score  FLOAT,
  why_skill    TEXT,      -- M5 explainability: why this skill matters
  why_course   TEXT,      -- M5 explainability: why this course was chosen
  created_at   TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE course_recommendations IS
  'Course picks from M4/M5 per skill gap, with M5 explainability text.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_recs_gap_id  ON course_recommendations (gap_id);
CREATE INDEX IF NOT EXISTS idx_course_recs_user_id ON course_recommendations (user_id);

-- =============================================================================
-- TABLE: roadmaps
-- Weekly learning plan + SVG timeline output from M5 Level 2.
-- =============================================================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  gap_id       UUID    NOT NULL REFERENCES skill_gaps(id) ON DELETE CASCADE,
  job_title    TEXT,
  weekly_plan  JSONB,      -- full M5 L1 structured weekly plan
  timeline_svg TEXT,       -- SVG string from M5 L2 timeline visual
  cards_svg    TEXT,       -- SVG string from M5 L2 roadmap cards
  total_weeks  INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE roadmaps IS
  'Personalized weekly learning roadmap with SVG visuals, produced by M5.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_gap_id  ON roadmaps (gap_id);

-- Trigger: keep updated_at current
CREATE OR REPLACE TRIGGER trg_roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: progress_logs
-- Tracks learner progress against a roadmap; supports decay flag from M5.
-- =============================================================================
CREATE TABLE IF NOT EXISTS progress_logs (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id      UUID    NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_id         UUID    NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  completed_items TEXT[],
  overall_pct     FLOAT   DEFAULT 0,
  last_active     TIMESTAMPTZ DEFAULT now(),
  milestones      JSONB,
  decayed         BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE progress_logs IS
  'Learner progress tracking per roadmap, including activity decay detection.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_logs_roadmap_id ON progress_logs (roadmap_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id    ON progress_logs (user_id);

-- =============================================================================
-- TABLE: notifications
-- In-app notifications with priority levels; users mark them read via UPDATE.
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT    NOT NULL,
  priority   TEXT    CHECK (priority IN ('info', 'warning', 'urgent')),
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE notifications IS
  'In-app notifications for job seekers and recruiters with tri-level priority.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

-- =============================================================================
-- TABLE: job_listings
-- Recruiter-owned job postings; only active=true rows shown to job seekers.
-- =============================================================================
CREATE TABLE IF NOT EXISTS job_listings (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  company         TEXT,
  description     TEXT,
  required_skills TEXT[],
  location        TEXT,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE job_listings IS
  'Recruiter job postings; active=false hides listing from job-seeker search.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_listings_recruiter_id ON job_listings (recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_active       ON job_listings (active);

-- Trigger: keep updated_at current
CREATE OR REPLACE TRIGGER trg_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLE: candidate_matches
-- M4 AI-computed match scores between a job listing and a job-seeker profile.
-- Unique constraint prevents duplicate computation for same (job, user) pair.
-- =============================================================================
CREATE TABLE IF NOT EXISTS candidate_matches (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         UUID    NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  user_id        UUID    NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  match_score    FLOAT,
  matched_skills TEXT[],
  missing_skills TEXT[],
  rank           INTEGER,
  computed_at    TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_candidate_matches_job_user UNIQUE (job_id, user_id)
);

COMMENT ON TABLE candidate_matches IS
  'M4-computed ranked candidate matches per job listing; unique per job+user pair.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidate_matches_job_id  ON candidate_matches (job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_user_id ON candidate_matches (user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_rank    ON candidate_matches (rank);
