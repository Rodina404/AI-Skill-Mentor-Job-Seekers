const { supabaseAdmin } = require('../config/supabase');

/**
 * Update user profile
 * PUT /users/:userId
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization: user updating their own profile, or admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You cannot update another user\'s profile' });
    }

    const { name, email, location } = req.body;

    let first_name = '';
    let last_name = '';
    if (name) {
      const spaceIdx = name.indexOf(' ');
      if (spaceIdx > 0) {
        first_name = name.substring(0, spaceIdx);
        last_name = name.substring(spaceIdx + 1);
      } else {
        first_name = name;
      }
    }

    const userUpdates = {};
    if (name !== undefined) {
      userUpdates.first_name = first_name;
      userUpdates.last_name = last_name;
    }
    if (email !== undefined) {
      // Keep Supabase Auth's login email in sync with public.users — otherwise the
      // user would see their new email in the UI but still have to log in with the
      // old one. Update Auth first so a failure (e.g. email already in use) never
      // leaves public.users pointing at an email the user can't actually log in with.
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
      if (authErr) throw new Error(`Failed to update login email: ${authErr.message}`);
      userUpdates.email = email;
    }

    // 1. Update public.users table if name or email changes
    if (Object.keys(userUpdates).length > 0) {
      const { error: userErr } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', userId);

      if (userErr) throw userErr;
    }

    // 2. Update public.job_seeker_profiles table if location changes
    if (location !== undefined) {
      const { error: profileErr } = await supabaseAdmin
        .from('job_seeker_profiles')
        .update({ location })
        .eq('user_id', userId);

      if (profileErr) throw profileErr;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: { first_name, last_name, email },
        profile: { location }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update career goals
 * PUT /users/:userId/goals
 */
const updateGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { goals } = req.body;

    // Check authorization
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You cannot update another user\'s goals' });
    }

    const { data, error } = await supabaseAdmin
      .from('job_seeker_profiles')
      .update({ goals: goals || [] })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      success: true,
      message: 'Goals updated successfully',
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get user's saved jobs
 * GET /users/:userId/saved-jobs
 */
const getSavedJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .select(`
        *,
        job_postings (
          id,
          title,
          company,
          location,
          job_type,
          status,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Return the array directly as expected by Frontend-React (JobsListing.tsx maps array)
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Save a job posting
 * POST /users/:userId/saved-jobs
 */
const saveJob = async (req, res) => {
  try {
    const { userId } = req.params;
    const { jobId, source = 'platform', externalJob } = req.body;

    // Check authorization
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    if (!['platform', 'adzuna'].includes(source)) {
      return res.status(400).json({ error: 'source must be platform or adzuna' });
    }

    let savedJob;
    if (source === 'platform') {
      if (!jobId) {
        return res.status(400).json({ error: 'jobId is required for platform jobs' });
      }
      savedJob = {
        user_id: userId,
        source: 'platform',
        job_posting_id: jobId
      };
    } else {
      const externalId = String(externalJob?.id || jobId || '').trim();
      const title = String(externalJob?.title || '').trim();
      const url = String(externalJob?.url || '').trim();
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: 'A valid external job URL is required' });
      }
      if (!externalId || !title || !['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: 'External jobs require id, title, and an HTTP(S) URL' });
      }
      savedJob = {
        user_id: userId,
        source: 'adzuna',
        job_posting_id: null,
        external_job_id: externalId,
        external_url: parsedUrl.toString(),
        external_title: title.slice(0, 300),
        external_company: String(externalJob?.company || '').trim().slice(0, 300) || null,
        external_location: String(externalJob?.location || '').trim().slice(0, 300) || null,
        external_description: String(externalJob?.description || '').trim().slice(0, 2000) || null
      };
    }

    const { data, error } = await supabaseAdmin
      .from('saved_jobs')
      .insert(savedJob)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Job already saved' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Remove saved job
 * DELETE /users/:userId/saved-jobs/:savedJobId
 */
const removeSavedJob = async (req, res) => {
  try {
    const { userId, savedJobId } = req.params;

    // Check authorization
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    const { error } = await supabaseAdmin
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('id', savedJobId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Job removed from saved list'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get user's enrolled courses
 * GET /users/:userId/courses
 */
const getUserCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization: user requesting their own courses, or admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // 1. Resolve job seeker profile ID
    let { data: profile, error: profileErr } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileErr || !profile) {
      // Auto-create profile if missing
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('job_seeker_profiles')
        .insert({ user_id: userId })
        .select('id')
        .single();

      if (createError) {
        return res.status(404).json({ error: 'Job seeker profile not found and could not be created' });
      }
      profile = newProfile;
    }

    // 2. Fetch enrolled courses (learning_progress with course_recommendations)
    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .select('*, course_recommendations(*)')
      .eq('job_seeker_profile_id', profile.id);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  updateProfile,
  updateGoals,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  getUserCourses
};
