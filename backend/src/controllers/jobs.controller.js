const { supabaseAdmin } = require('../config/supabase');

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

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  approveJob
};
