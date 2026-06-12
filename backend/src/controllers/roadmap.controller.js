const { supabaseAdmin } = require('../config/supabase');

const getRoadmapByResumeId = async (req, res) => {
  const { resumeId } = req.params;
  const userId = req.user.id;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('roadmaps')
      .select('*')
      .eq('resume_id', resumeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    res.json(data);
  } catch (err) {
    console.error('getRoadmapByResumeId error:', err.message);
    res.status(500).json({ error: 'Failed to fetch roadmap', details: err.message });
  }
};

module.exports = { getRoadmapByResumeId };
