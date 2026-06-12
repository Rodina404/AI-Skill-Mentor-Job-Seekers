const { supabaseAdmin } = require('../config/supabase');

const getProfileId = async (userId) => {
  const { data: profile } = await supabaseAdmin
    .from('job_seeker_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return profile?.id;
};

const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = await getProfileId(userId);
    if (!profileId) return res.status(404).json({ error: 'Profile not found' });

    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .select('*, course_recommendations(*)')
      .eq('job_seeker_profile_id', profileId);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, status, progress } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }
    const profileId = await getProfileId(userId);
    if (!profileId) return res.status(404).json({ error: 'Profile not found' });

    const { data, error } = await supabaseAdmin
      .from('learning_progress')
      .upsert({
        job_seeker_profile_id: profileId,
        course_recommendation_id: courseId,
        status: status || 'in_progress',
        completion_percentage: progress || 0,
        enrolled_at: new Date().toISOString()
      }, { onConflict: 'job_seeker_profile_id,course_recommendation_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProgress, updateProgress };
