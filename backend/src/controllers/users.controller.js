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
 * Update career goals (Stubbed 501 - missing goals column)
 * PUT /users/:userId/goals
 */
const updateGoals = async (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Goals column (goals/target_role) is missing from the job_seeker_profiles table in the database schema.'
  });
};

/**
 * Get user's saved jobs (Stubbed 501 - missing saved_jobs table)
 * GET /users/:userId/saved-jobs
 */
const getSavedJobs = async (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Saved jobs database table (saved_jobs) is missing from the database schema.'
  });
};

/**
 * Save a job posting (Stubbed 501 - missing saved_jobs table)
 * POST /users/:userId/saved-jobs
 */
const saveJob = async (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Saved jobs database table (saved_jobs) is missing from the database schema.'
  });
};

/**
 * Remove saved job (Stubbed 501 - missing saved_jobs table)
 * DELETE /users/:userId/saved-jobs/:jobId
 */
const removeSavedJob = async (req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Saved jobs database table (saved_jobs) is missing from the database schema.'
  });
};

module.exports = {
  updateProfile,
  updateGoals,
  getSavedJobs,
  saveJob,
  removeSavedJob
};
