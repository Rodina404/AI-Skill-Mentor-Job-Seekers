-- =============================================================================
-- 002_rls_policies.sql
-- AI Skill Mentor – Row Level Security Policies
-- Must be run AFTER 001_initial_schema.sql
-- =============================================================================

-- =============================================================================
-- TABLE: users
-- A user may only SELECT and UPDATE their own row (id = auth.uid()).
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own row"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users: update own row"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- TABLE: user_profiles
-- • Any authenticated user can SELECT all profiles (recruiters need this).
-- • A user can INSERT / UPDATE only their own profile (user_id = auth.uid()).
-- =============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles: any auth user can select"
  ON user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "user_profiles: insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles: update own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TABLE: skill_gaps
-- A user can SELECT and INSERT only their own rows. No UPDATE / DELETE.
-- =============================================================================
ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skill_gaps: select own rows"
  ON skill_gaps FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "skill_gaps: insert own rows"
  ON skill_gaps FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TABLE: course_recommendations
-- A user can SELECT only their own rows.
-- (INSERT is done server-side by the Node.js backend / Python microservices
--  using the service role key, which bypasses RLS.)
-- =============================================================================
ALTER TABLE course_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_recommendations: select own rows"
  ON course_recommendations FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================================
-- TABLE: roadmaps
-- A user can SELECT only their own rows.
-- (INSERT done server-side via service role.)
-- =============================================================================
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmaps: select own rows"
  ON roadmaps FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================================
-- TABLE: progress_logs
-- A user can SELECT and UPDATE only their own rows.
-- (INSERT done server-side via service role when roadmap is first created.)
-- =============================================================================
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_logs: select own rows"
  ON progress_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "progress_logs: update own rows"
  ON progress_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TABLE: notifications
-- A user can SELECT their own notifications and UPDATE them (mark as read).
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: select own rows"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications: update own rows (mark read)"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TABLE: job_listings
-- • Any authenticated user can SELECT active listings (active = true).
-- • A recruiter can INSERT / UPDATE / DELETE only their own listings.
-- =============================================================================
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_listings: any auth user can select active"
  ON job_listings FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND active = true
  );

-- Recruiters also need to see their own inactive listings (e.g. dashboard)
CREATE POLICY "job_listings: recruiter can select own"
  ON job_listings FOR SELECT
  USING (recruiter_id = auth.uid());

CREATE POLICY "job_listings: recruiter can insert own"
  ON job_listings FOR INSERT
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "job_listings: recruiter can update own"
  ON job_listings FOR UPDATE
  USING (recruiter_id = auth.uid())
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "job_listings: recruiter can delete own"
  ON job_listings FOR DELETE
  USING (recruiter_id = auth.uid());

-- =============================================================================
-- TABLE: candidate_matches
-- • A recruiter can SELECT matches where the job belongs to them.
-- • A job seeker can SELECT their own matches.
-- (INSERT / UPDATE done server-side by M4 via service role key.)
-- =============================================================================
ALTER TABLE candidate_matches ENABLE ROW LEVEL SECURITY;

-- Job seeker: see their own match rows
CREATE POLICY "candidate_matches: job seeker selects own"
  ON candidate_matches FOR SELECT
  USING (user_id = auth.uid());

-- Recruiter: see matches for jobs they own
CREATE POLICY "candidate_matches: recruiter selects own job matches"
  ON candidate_matches FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM job_listings WHERE recruiter_id = auth.uid()
    )
  );
