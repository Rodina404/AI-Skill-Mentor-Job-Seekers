-- ==========================================
-- Execution Order: 1 of 3
-- Purpose: Defines base schema and tables, enables RLS.
-- AI Skill Mentor Platform
-- ==========================================

-- 1. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'other'
);

-- 2. Job Postings Table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    job_description TEXT,
    location TEXT,
    company TEXT,
    required_skills JSONB DEFAULT '[]'::jsonb,
    job_type TEXT,
    status TEXT DEFAULT 'open',
    recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    status TEXT DEFAULT 'processing' NOT NULL,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    normalized_skills JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Skill Gaps Table
CREATE TABLE IF NOT EXISTS public.skill_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_seeker_profile_id UUID NOT NULL REFERENCES public.job_seeker_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE SET NULL,
    gap_level TEXT DEFAULT 'high',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. User Skills Table
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_seeker_profile_id UUID NOT NULL REFERENCES public.job_seeker_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency TEXT DEFAULT 'intermediate',
    years_of_experience NUMERIC DEFAULT 0.0,
    source TEXT DEFAULT 'manual',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT user_skills_profile_skill_unique UNIQUE (job_seeker_profile_id, skill_id)
);

-- 6. Candidate Matches Table
CREATE TABLE IF NOT EXISTS public.candidate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    job_seeker_profile_id UUID NOT NULL REFERENCES public.job_seeker_profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    overall_score NUMERIC DEFAULT 0.0,
    skill_match_score NUMERIC DEFAULT 0.0,
    experience_match_score NUMERIC DEFAULT 0.0,
    education_match_score NUMERIC DEFAULT 0.0,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    confidence_score NUMERIC DEFAULT 0.0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    match_score INT DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT candidate_matches_job_seeker_unique UNIQUE (job_posting_id, job_seeker_profile_id)
);

-- 7. Readiness Scores Table
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_seeker_profile_id UUID NOT NULL REFERENCES public.job_seeker_profiles(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    overall_score NUMERIC DEFAULT 0.0,
    skill_score NUMERIC DEFAULT 0.0,
    experience_score NUMERIC DEFAULT 0.0,
    education_score NUMERIC DEFAULT 0.0,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. Course Recommendations Table
CREATE TABLE IF NOT EXISTS public.course_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_gap_id UUID REFERENCES public.skill_gaps(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    course_id TEXT NOT NULL,
    course_title TEXT NOT NULL,
    course_provider TEXT,
    course_url TEXT,
    course_level TEXT,
    course_duration NUMERIC DEFAULT 0,
    course_rating NUMERIC DEFAULT 0.0,
    course_price NUMERIC DEFAULT 0.0,
    price_currency TEXT DEFAULT 'USD',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 9. Learning Progress Table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_seeker_profile_id UUID NOT NULL REFERENCES public.job_seeker_profiles(id) ON DELETE CASCADE,
    course_recommendation_id UUID NOT NULL REFERENCES public.course_recommendations(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' NOT NULL,
    completion_percentage NUMERIC DEFAULT 0.0 NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT learning_progress_profile_course_unique UNIQUE (job_seeker_profile_id, course_recommendation_id)
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ==========================================
-- Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
