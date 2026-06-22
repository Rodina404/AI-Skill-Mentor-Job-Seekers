-- Add learning preferences to job_seeker_profiles
ALTER TABLE public.job_seeker_profiles
    ADD COLUMN IF NOT EXISTS hours_per_week NUMERIC DEFAULT 10,
    ADD COLUMN IF NOT EXISTS deadline_weeks INTEGER DEFAULT 8;

-- Add roadmap-to-course link
ALTER TABLE public.course_recommendations
    ADD COLUMN IF NOT EXISTS roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS course_recommendations_roadmap_id_idx 
    ON public.course_recommendations(roadmap_id);

-- Add progress_snapshot to roadmaps for M5's own tracking
ALTER TABLE public.roadmaps
    ADD COLUMN IF NOT EXISTS progress_snapshot JSONB DEFAULT '{}'::jsonb;
