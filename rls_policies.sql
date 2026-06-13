-- ==========================================
-- Execution Order: 3 of 3
-- Purpose: Configures row-level security (RLS) policies for all tables.
-- AI Skill Mentor Platform
-- ==========================================

-- Drop existing policies for the 10 tables + roadmaps to ensure idempotency
DROP POLICY IF EXISTS "Allow read access to all users" ON public.skills;

DROP POLICY IF EXISTS "Allow public read access to job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow recruiters to insert job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow recruiters to update their own job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow recruiters to delete their own job postings" ON public.job_postings;

DROP POLICY IF EXISTS "Allow users to read their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow users to insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow users to update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow users to delete their own resumes" ON public.resumes;

DROP POLICY IF EXISTS "Allow users to read their own skill gaps" ON public.skill_gaps;
DROP POLICY IF EXISTS "Allow users to insert their own skill gaps" ON public.skill_gaps;
DROP POLICY IF EXISTS "Allow users to update their own skill gaps" ON public.skill_gaps;
DROP POLICY IF EXISTS "Allow users to delete their own skill gaps" ON public.skill_gaps;

DROP POLICY IF EXISTS "Allow users to read their own user skills" ON public.user_skills;
DROP POLICY IF EXISTS "Allow users to insert their own user skills" ON public.user_skills;
DROP POLICY IF EXISTS "Allow users to update their own user skills" ON public.user_skills;
DROP POLICY IF EXISTS "Allow users to delete their own user skills" ON public.user_skills;

DROP POLICY IF EXISTS "Allow users to read their own matches or owned posting matches" ON public.candidate_matches;

DROP POLICY IF EXISTS "Allow users to read their own readiness scores or owned posting scores" ON public.readiness_scores;

DROP POLICY IF EXISTS "Allow users to read their own course recommendations" ON public.course_recommendations;
DROP POLICY IF EXISTS "Allow users to insert their own course recommendations" ON public.course_recommendations;
DROP POLICY IF EXISTS "Allow users to update their own course recommendations" ON public.course_recommendations;
DROP POLICY IF EXISTS "Allow users to delete their own course recommendations" ON public.course_recommendations;

DROP POLICY IF EXISTS "Allow users to read their own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Allow users to insert their own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Allow users to update their own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Allow users to delete their own learning progress" ON public.learning_progress;

DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to update their own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Allow users to read their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Allow users to insert their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Allow users to update their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Allow users to delete their own roadmaps" ON public.roadmaps;

-- 1. Skills Policies
CREATE POLICY "Allow read access to all users"
    ON public.skills FOR SELECT
    USING (true);

-- 2. Job Postings Policies
CREATE POLICY "Allow public read access to job postings"
    ON public.job_postings FOR SELECT
    USING (true);

CREATE POLICY "Allow recruiters to insert job postings"
    ON public.job_postings FOR INSERT
    TO authenticated
    WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Allow recruiters to update their own job postings"
    ON public.job_postings FOR UPDATE
    TO authenticated
    USING (recruiter_id = auth.uid())
    WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Allow recruiters to delete their own job postings"
    ON public.job_postings FOR DELETE
    TO authenticated
    USING (recruiter_id = auth.uid());

-- 3. Resumes Policies
CREATE POLICY "Allow users to read their own resumes"
    ON public.resumes FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own resumes"
    ON public.resumes FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own resumes"
    ON public.resumes FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own resumes"
    ON public.resumes FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 4. Skill Gaps Policies
CREATE POLICY "Allow users to read their own skill gaps"
    ON public.skill_gaps FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own skill gaps"
    ON public.skill_gaps FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own skill gaps"
    ON public.skill_gaps FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own skill gaps"
    ON public.skill_gaps FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 5. User Skills Policies (Uses job_seeker_profile subquery)
CREATE POLICY "Allow users to read their own user skills"
    ON public.user_skills FOR SELECT
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to insert their own user skills"
    ON public.user_skills FOR INSERT
    TO authenticated
    WITH CHECK (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to update their own user skills"
    ON public.user_skills FOR UPDATE
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()))
    WITH CHECK (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to delete their own user skills"
    ON public.user_skills FOR DELETE
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

-- 6. Candidate Matches Policies
CREATE POLICY "Allow users to read their own matches or owned posting matches"
    ON public.candidate_matches FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR job_posting_id IN (SELECT id FROM public.job_postings WHERE recruiter_id = auth.uid()));

-- 7. Readiness Scores Policies
CREATE POLICY "Allow users to read their own readiness scores or owned posting scores"
    ON public.readiness_scores FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR job_posting_id IN (SELECT id FROM public.job_postings WHERE recruiter_id = auth.uid()));

-- 8. Course Recommendations Policies
CREATE POLICY "Allow users to read their own course recommendations"
    ON public.course_recommendations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own course recommendations"
    ON public.course_recommendations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own course recommendations"
    ON public.course_recommendations FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own course recommendations"
    ON public.course_recommendations FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 9. Learning Progress Policies (Uses job_seeker_profile subquery)
CREATE POLICY "Allow users to read their own learning progress"
    ON public.learning_progress FOR SELECT
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to insert their own learning progress"
    ON public.learning_progress FOR INSERT
    TO authenticated
    WITH CHECK (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to update their own learning progress"
    ON public.learning_progress FOR UPDATE
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()))
    WITH CHECK (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Allow users to delete their own learning progress"
    ON public.learning_progress FOR DELETE
    TO authenticated
    USING (job_seeker_profile_id IN (SELECT id FROM public.job_seeker_profiles WHERE user_id = auth.uid()));

-- 10. Notifications Policies
CREATE POLICY "Allow users to read their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 11. Roadmaps Policies
CREATE POLICY "Allow users to read their own roadmaps"
    ON public.roadmaps FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Allow users to insert their own roadmaps"
    ON public.roadmaps FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their own roadmaps"
    ON public.roadmaps FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own roadmaps"
    ON public.roadmaps FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
