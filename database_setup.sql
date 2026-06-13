-- ==========================================
-- Execution Order: 2 of 3
-- Purpose: Defines roadmaps, users, job seeker profiles, registers triggers, and storage.
-- AI Skill Mentor Platform
-- ==========================================

-- ------------------------------------------
-- 1. Create Roadmaps Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    roadmap_data JSONB NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS roadmaps_resume_id_idx ON public.roadmaps(resume_id);
CREATE INDEX IF NOT EXISTS roadmaps_job_id_idx ON public.roadmaps(job_id);

-- Enable RLS on roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write their own roadmaps
CREATE POLICY "Allow users to read their own roadmaps"
    ON public.roadmaps FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own roadmaps"
    ON public.roadmaps FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own roadmaps"
    ON public.roadmaps FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own roadmaps"
    ON public.roadmaps FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- ------------------------------------------
-- 2. Alter Tables to Support Required Schema Columns
-- ------------------------------------------

-- job_postings: Add company column
ALTER TABLE public.job_postings 
    ADD COLUMN IF NOT EXISTS company TEXT;

-- candidate_matches: Add user_id, match_score, and skill_match_score columns
ALTER TABLE public.candidate_matches 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS match_score INT,
    ADD COLUMN IF NOT EXISTS skill_match_score NUMERIC;

-- Add index for candidate_matches performance
CREATE INDEX IF NOT EXISTS candidate_matches_user_id_idx ON public.candidate_matches(user_id);

-- readiness_scores: Add user_id column
ALTER TABLE public.readiness_scores 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for readiness_scores performance
CREATE INDEX IF NOT EXISTS readiness_scores_user_id_idx ON public.readiness_scores(user_id);

-- skill_gaps: Add user_id column
ALTER TABLE public.skill_gaps 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for skill_gaps performance
CREATE INDEX IF NOT EXISTS skill_gaps_user_id_idx ON public.skill_gaps(user_id);

-- course_recommendations: Add user_id column
ALTER TABLE public.course_recommendations 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for course_recommendations performance
CREATE INDEX IF NOT EXISTS course_recommendations_user_id_idx ON public.course_recommendations(user_id);


-- ------------------------------------------
-- 3. Automated User Profile Synchronization Trigger
-- ------------------------------------------

-- Ensure public.users and public.job_seeker_profiles exist with correct fields before setting up trigger
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'job_seeker',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    years_of_experience NUMERIC DEFAULT 0.0,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger function to synchronize auth.users -> public.users & job_seeker_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name_val TEXT;
    first_name_val TEXT;
    last_name_val TEXT;
    user_role_val TEXT;
BEGIN
    -- Extract full_name and role from auth.users metadata
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', '');
    user_role_val := COALESCE(new.raw_user_meta_data->>'role', 'job_seeker');

    -- Split full_name into first_name and last_name
    IF position(' ' in full_name_val) > 0 THEN
        first_name_val := substring(full_name_val from 1 for position(' ' in full_name_val) - 1);
        last_name_val := substring(full_name_val from position(' ' in full_name_val) + 1);
    ELSE
        first_name_val := full_name_val;
        last_name_val := '';
    END IF;

    -- Insert or update user record in public.users
    INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
        new.id,
        new.email,
        first_name_val,
        last_name_val,
        user_role_val,
        COALESCE(new.created_at, now()),
        COALESCE(new.updated_at, now())
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        updated_at = now();

    -- Create profile in public.job_seeker_profiles if the user is a job seeker
    IF user_role_val = 'job_seeker' THEN
        INSERT INTO public.job_seeker_profiles (user_id, years_of_experience, location, created_at, updated_at)
        VALUES (
            new.id,
            0.0,
            '',
            COALESCE(new.created_at, now()),
            COALESCE(new.updated_at, now())
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------
-- 4. Storage Bucket Configuration & RLS Rules
-- ------------------------------------------

-- Ensure the 'resumes' storage bucket is created (marked as private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes', 
    'resumes', 
    false, -- Private bucket
    5242880, -- 5 MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
-- Note: Commented out because RLS is typically enabled by default on storage.objects, 
-- and altering this table directly might throw a "must be owner of table objects" error depending on connection role.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing resumes policies if they exist to prevent conflicts
DROP POLICY IF EXISTS "Allow owners to read their resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to upload their resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to update their resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete their resumes" ON storage.objects;

-- Storage Policy: SELECT (Read)
CREATE POLICY "Allow owners to read their resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' 
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- Storage Policy: INSERT (Create/Upload)
CREATE POLICY "Allow owners to upload their resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' 
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- Storage Policy: UPDATE
CREATE POLICY "Allow owners to update their resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' 
    AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'resumes' 
    AND split_part(name, '/', 1) = auth.uid()::text
);

-- Storage Policy: DELETE
CREATE POLICY "Allow owners to delete their resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' 
    AND split_part(name, '/', 1) = auth.uid()::text
);
