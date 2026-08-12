const { supabaseAdmin } = require('../config/supabase');
const { persistAndConfirmJobRecommendations } = require('../repositories/jobRecommendations.repository');

const recommendationError = (code, message, statusCode = 500) => {
  const error = new Error(message);
  error.apiCode = code;
  error.statusCode = statusCode;
  return error;
};

/**
 * Get all job postings
 * GET /jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const { location, jobType, type, status = 'open' } = req.query;
    let query = supabaseAdmin.from('job_postings').select('*').eq('status', status);

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const filterType = jobType || type;
    if (filterType && filterType !== 'all') {
      // Normalize frontend types (e.g. full-time -> full_time)
      const dbType = filterType.toLowerCase().replace('-', '_');
      query = query.eq('job_type', dbType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // The frontend expects { success: true, data: { jobs: [...] } }
    res.json({
      success: true,
      data: {
        jobs: data || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get jobs owned by the authenticated recruiter.
 * GET /jobs/recruiter/my-jobs
 */
const getRecruiterJobs = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Recruiter or admin role required' });
    }

    const { status } = req.query;
    let query = supabaseAdmin
      .from('job_postings')
      .select('*');

    if (req.user.role !== 'admin') {
      query = query.eq('recruiter_id', req.user.id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({
      success: true,
      data: {
        jobs: data || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get job posting by ID
 * GET /jobs/:jobId
 */
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create new job posting (Recruiter only)
 * POST /jobs
 */
const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Recruiter or admin role required' });
    }

    const {
      title,
      job_description,
      description,
      location,
      company,
      required_skills,
      job_type,
      jobType,
      status = 'open'
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const finalDescription = job_description || description || '';
    const finalJobType = job_type || jobType || 'full_time';

    const { data, error } = await supabaseAdmin
      .from('job_postings')
      .insert({
        title,
        job_description: finalDescription,
        location: location || 'Remote',
        company: company || 'Company',
        required_skills: required_skills || [],
        job_type: finalJobType,
        status,
        recruiter_id: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        job: data
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update job posting (Recruiter/Admin only, owns posting)
 * PUT /jobs/:jobId
 */
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Fetch posting to verify ownership
    const { data: job, error: fetchErr } = await supabaseAdmin
      .from('job_postings')
      .select('recruiter_id')
      .eq('id', jobId)
      .single();

    if (fetchErr || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this job posting' });
    }

    const {
      title,
      job_description,
      description,
      location,
      company,
      required_skills,
      job_type,
      jobType,
      status
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (job_description !== undefined) updates.job_description = job_description;
    if (description !== undefined) updates.job_description = description;
    if (location !== undefined) updates.location = location;
    if (company !== undefined) updates.company = company;
    if (required_skills !== undefined) updates.required_skills = required_skills;
    if (status !== undefined) updates.status = status;

    const finalJobType = job_type || jobType;
    if (finalJobType !== undefined) {
      updates.job_type = finalJobType.toLowerCase().replace('-', '_');
    }

    const { data: updatedJob, error: updateErr } = await supabaseAdmin
      .from('job_postings')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete job posting (Recruiter/Admin only, owns posting)
 * DELETE /jobs/:jobId
 */
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Fetch posting to verify ownership
    const { data: job, error: fetchErr } = await supabaseAdmin
      .from('job_postings')
      .select('recruiter_id')
      .eq('id', jobId)
      .single();

    if (fetchErr || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this job posting' });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('job_postings')
      .delete()
      .eq('id', jobId);

    if (deleteErr) throw deleteErr;

    res.json({
      success: true,
      message: 'Job deleted'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Apply to job
 * POST /jobs/:jobId/apply
 */
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Fetch job seeker profile ID
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Job seeker profile not found' });
    }

    // 2. Fetch user's latest resume
    const { data: latestResume, error: resumeErr } = await supabaseAdmin
      .from('resumes')
      .select('id')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const resumeId = latestResume && latestResume.length > 0 ? latestResume[0].id : null;

    // 3. Insert application record
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_posting_id: jobId,
        job_seeker_profile_id: profile.id,
        user_id: req.user.id,
        resume_id: resumeId
      })
      .select()
      .single();

    if (error) {
      // 23505 is PostgreSQL code for unique violation (unique user_id + job_posting_id)
      if (error.code === '23505') {
        return res.status(409).json({ error: 'You have already applied to this job' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get job applicants
 * GET /jobs/:jobId/applicants
 */
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify ownership of the job posting
    const { data: job, error: fetchErr } = await supabaseAdmin
      .from('job_postings')
      .select('recruiter_id')
      .eq('id', jobId)
      .single();

    if (fetchErr || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this job posting' });
    }

    // Fetch applicants with joined user details
    const { data: applications, error: appErr } = await supabaseAdmin
      .from('job_applications')
      .select(`
        *,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('job_posting_id', jobId);

    if (appErr) throw appErr;

    // Fetch candidate matches to retrieve matching metrics
    const { data: matches, error: matchesErr } = await supabaseAdmin
      .from('candidate_matches')
      .select('*')
      .eq('job_posting_id', jobId);

    if (matchesErr) throw matchesErr;

    const candidates = (applications || []).map(app => {
      const match = (matches || []).find(m => m.user_id === app.user_id);
      const fullName = app.users ? `${app.users.first_name || ''} ${app.users.last_name || ''}`.trim() : 'Job Seeker';

      return {
        name: fullName,
        email: app.users?.email || '',
        score: match ? match.match_score || Math.round((match.overall_score || 0) * 100) : 75,
        matchedSkills: match ? match.matched_skills || [] : [],
        missingSkills: match ? match.missing_skills || [] : []
      };
    });

    res.json({
      success: true,
      data: {
        candidates
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Approve job (Admin only)
 * POST /jobs/:jobId/approve
 */
const approveJob = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin role required' });
    }

    const { jobId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('job_postings')
      .update({ status: 'open' })
      .eq('id', jobId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      message: 'Job posting approved and is now live',
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get job recommendations from Adzuna (Job Recommendation Service)
 * GET /jobs/recommended
 */
const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, location } = req.query;

    // 1. Fetch latest analyzed resume for the user
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'analyzed')
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resumeError) {
      throw recommendationError(
        'SUPABASE_RESUME_READ_FAILED',
        `Supabase could not read the analyzed resume: ${resumeError.message}`
      );
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'No analyzed resume found. Please upload and analyze a resume first to get recommendations.'
        }
      });
    }

    // 2. Extract profile details
    const skills = (resume.normalized_skills || []).map(s => s.name || s.skill || s.skillId || s).filter(Boolean);
    const exp = resume.extracted_data?.experience || {};
    const experienceYears = Math.round(parseFloat(exp.years) || 0);

    const edu = (resume.extracted_data?.education && resume.extracted_data.education.length > 0)
      ? resume.extracted_data.education[0]
      : null;
    const education = edu ? edu.degree || "" : "";

    // 3. Fetch location preference fallback
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('location')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw recommendationError(
        'SUPABASE_PROFILE_READ_FAILED',
        `Supabase could not read the job-seeker profile: ${profileError.message}`
      );
    }

    const finalLocation = location || profile?.location || "";
    const jobTitle = search || resume.extracted_data?.jobTitle || "Software Engineer";

    // Reuse the latest persisted skill-gap output. Do not recalculate readiness here.
    const [matchResult, readinessResult] = await Promise.all([
      supabaseAdmin
        .from('candidate_matches')
        .select('matched_skills, missing_skills, skill_match_score')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('readiness_scores')
        .select('overall_score')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    if (matchResult.error) {
      throw recommendationError(
        'SUPABASE_SKILL_PROFILE_READ_FAILED',
        `Supabase could not read the skill-gap profile: ${matchResult.error.message}`
      );
    }
    if (readinessResult.error) {
      throw recommendationError(
        'SUPABASE_READINESS_READ_FAILED',
        `Supabase could not read readiness data: ${readinessResult.error.message}`
      );
    }

    const latestMatch = matchResult.data;
    const latestReadiness = readinessResult.data;
    if (!latestMatch) {
      throw recommendationError(
        'SKILL_GAP_PROFILE_NOT_FOUND',
        'No persisted skill-gap profile was found. Run skill-gap analysis before requesting jobs.',
        409
      );
    }
    if (!latestReadiness || latestReadiness.overall_score == null) {
      throw recommendationError(
        'READINESS_SCORE_NOT_FOUND',
        'No persisted readiness score was found. Run skill-gap analysis before requesting jobs.',
        409
      );
    }

    const persistedSkills = (latestMatch.matched_skills || []).map(s => s.name || s.skill || s.skillId || s).filter(Boolean);
    if (persistedSkills.length === 0) {
      throw recommendationError(
        'SKILL_GAP_PROFILE_EMPTY',
        'The persisted skill-gap profile contains no matched skills.',
        409
      );
    }

    // 4. Build payload and POST to job_recommendation_service
    const jobRecUrl = process.env.JOB_REC_URL || 'http://localhost:8007';
    const payload = {
      user_id: userId,
      user_profile: {
        skills: persistedSkills,
        experience_years: experienceYears,
        education,
        location: finalLocation
      },
      job_title: jobTitle,
      top_n: 20,
      skill_gap: {
        matched_skills: latestMatch?.matched_skills || [],
        missing_skills: latestMatch?.missing_skills || [],
        required_skills: [],
        readiness_score: latestReadiness?.overall_score ?? null
      }
    };

    console.log(`[JobRec] POSTing to ${jobRecUrl}/run for user ${userId} with job_title="${jobTitle}"`);
    const axios = require('axios');
    const { data: responseData } = await axios.post(`${jobRecUrl}/run`, payload, { timeout: 120000 });

    if (!responseData.success) {
      return res.status(500).json({
        success: false,
        error: responseData.error || { message: 'Recommendation service returned failure status' }
      });
    }

    const recommendations = responseData.data?.recommendations || [];
    const persistence = await persistAndConfirmJobRecommendations({
      userId,
      resumeId: resume.id,
      recommendations
    });

    return res.json({
      success: true,
      data: {
        jobs: recommendations,
        recommendation_session_id: persistence.sessionId,
        persisted_rows: persistence.rows
      }
    });

  } catch (err) {
    console.error('[getRecommendedJobs] Error:', err.message);
    if (err.apiCode || err.name === 'JobRecommendationPersistenceError') {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.apiCode || err.code,
          message: err.message
        }
      });
    }
    if (err.response && err.response.data) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'RECOMMENDATION_FAILED',
        message: err.message || 'Failed to fetch job recommendations'
      }
    });
  }
};

/**
 * AI Candidate Discovery for a Job Posting (Recruiter/Admin only)
 * POST /jobs/:jobId/match-candidates
 */
const { runRecruiterJobMatching, RecruiterMatchingError } = require('../services/recruiterMatching.service');
const { persistRecruiterMatches, getPersistedCandidateMatches, RecruiterMatchPersistenceError } = require('../repositories/recruiterMatches.repository');

const matchCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Valid authentication token required' });
    }

    const result = await runRecruiterJobMatching({
      jobId,
      recruiterId: req.user.id,
      userRole: req.user.role,
    });

    let persistenceResult = { persisted: false, reason: 'none' };
    try {
      persistenceResult = await persistRecruiterMatches({
        jobId,
        rankedCandidates: result.data?.rankedCandidates || [],
        completionStatus: result.data?.completionStatus || 'complete',
      });
    } catch (pErr) {
      console.error(`[JobsController] Persistence error for job ${jobId}:`, pErr.message);
      persistenceResult = { persisted: false, error: pErr.message };
    }

    result.data.persistence = persistenceResult;
    return res.json(result);
  } catch (err) {
    if (err instanceof RecruiterMatchingError || err.statusCode) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'MATCHING_ERROR',
          message: err.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred during candidate matching',
      },
    });
  }
};

/**
 * Retrieves persisted candidate matches for a recruiter's job (Recruiter/Admin only)
 * GET /jobs/:jobId/candidate-matches
 */
const getCandidateMatchesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Valid authentication token required' });
    }

    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Recruiter or Admin access required' });
    }

    const result = await getPersistedCandidateMatches({
      jobId,
      recruiterId: req.user.id,
      userRole: req.user.role,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.json(result);
  } catch (err) {
    if (err instanceof RecruiterMatchPersistenceError || err.statusCode) {
      return res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'PERSISTENCE_ERROR',
          message: err.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred while fetching candidate matches',
      },
    });
  }
};

/**
 * Generate a short-lived temporary Supabase Storage Signed URL for a candidate's resume
 * GET /jobs/:jobId/candidates/:candidateId/resume-url
 */
const getCandidateResumeUrl = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;

    // TASK 4: Authentication check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Valid authentication token required' });
    }

    // TASK 5: Role Authorization check
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Recruiter or Admin role required' });
    }

    // TASK 6: Job Ownership Authorization
    const { data: job, error: jobErr } = await supabaseAdmin
      .from('job_postings')
      .select('id, recruiter_id')
      .eq('id', jobId)
      .single();

    if (jobErr || !job) {
      return res.status(404).json({ error: 'Job posting not found' });
    }

    if (req.user.role !== 'admin' && job.recruiter_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: You do not own this job posting' });
    }

    // Candidate Profile Resolution
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id, user_id, is_discoverable')
      .eq('id', candidateId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    // TASK 7: Candidate Relationship Authorization (BOLA Prevention)
    // Check Application Relationship (Case B)
    const { data: appData } = await supabaseAdmin
      .from('job_applications')
      .select('id, resume_id, user_id')
      .eq('job_posting_id', jobId)
      .or(`job_seeker_profile_id.eq.${candidateId},user_id.eq.${profile.user_id}`)
      .limit(1);

    const hasApplication = Array.isArray(appData) && appData.length > 0;
    const appResumeId = hasApplication ? appData[0].resume_id : null;

    // Check AI Match Relationship (Case A)
    const { data: matchData } = await supabaseAdmin
      .from('candidate_matches')
      .select('id')
      .eq('job_posting_id', jobId)
      .eq('job_seeker_profile_id', candidateId)
      .limit(1);

    const hasAIMatch = Array.isArray(matchData) && matchData.length > 0;

    // BOLA Authorization Gate
    if (!hasApplication && !hasAIMatch) {
      return res.status(403).json({ error: 'Access denied: Candidate has no application or AI match relationship with this job' });
    }

    // TASK 8: Candidate Opt-Out Policy for AI-Discovery-Only Access
    if (!hasApplication && hasAIMatch && profile.is_discoverable === false) {
      return res.status(403).json({ error: 'Access denied: Candidate has opted out of discovery and has no active job application' });
    }

    // TASK 2, 9, 10, 19, 20: Authoritative Resume Resolution
    let resumeRecord = null;

    // For Applicants with specific appResumeId:
    if (appResumeId) {
      const { data: rData } = await supabaseAdmin
        .from('resumes')
        .select('id, user_id, file_path, original_name, status')
        .eq('id', appResumeId)
        .single();

      if (rData && rData.user_id === profile.user_id) {
        resumeRecord = rData;
      }
    }

    // For AI Matches or Fallback:
    if (!resumeRecord) {
      const { data: resumes } = await supabaseAdmin
        .from('resumes')
        .select('id, user_id, file_path, original_name, status')
        .eq('user_id', profile.user_id)
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (Array.isArray(resumes) && resumes.length > 0) {
        resumeRecord = resumes[0];
      } else {
        // Fallback to latest uploaded resume regardless of status
        const { data: fallbackResumes } = await supabaseAdmin
          .from('resumes')
          .select('id, user_id, file_path, original_name, status')
          .eq('user_id', profile.user_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (Array.isArray(fallbackResumes) && fallbackResumes.length > 0) {
          resumeRecord = fallbackResumes[0];
        }
      }
    }

    if (!resumeRecord || !resumeRecord.file_path) {
      return res.status(404).json({ error: 'No resume file found for candidate' });
    }

    // TASK 9: Resume Ownership Verification (resume.user_id MUST equal profile.user_id)
    if (resumeRecord.user_id !== profile.user_id) {
      return res.status(403).json({ error: 'Access denied: Resume ownership mismatch' });
    }

    // TASK 12: Generate Temporary Signed URL
    const ttlSeconds = parseInt(process.env.RESUME_SIGNED_URL_TTL_SECONDS, 10) || 900; // 15 mins (900s)
    const bucketName = 'resumes';

    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(resumeRecord.file_path, ttlSeconds);

    if (signError || !signedData?.signedUrl) {
      console.error('[ResumeSignedUrl] Storage signing error:', signError?.message);
      return res.status(500).json({ error: 'Failed to generate temporary resume signed URL' });
    }

    // TASK 14: Safe Logging (never log signedUrl token or content)
    console.log(`[ResumeSignedUrl] Signed URL created for candidate ${candidateId}, job ${jobId}, TTL ${ttlSeconds}s`);

    // TASK 13: Response Contract
    return res.json({
      success: true,
      data: {
        url: signedData.signedUrl,
        expiresIn: ttlSeconds,
        originalName: resumeRecord.original_name || 'resume.pdf',
      },
    });
  } catch (err) {
    console.error('[ResumeSignedUrl] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error while generating resume signed URL' });
  }
};

module.exports = {
  getAllJobs,
  getRecruiterJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  approveJob,
  getRecommendedJobs,
  matchCandidatesForJob,
  getCandidateMatchesForJob,
  getCandidateResumeUrl,
};
