const { supabaseAdmin } = require('../config/supabase');

const getProfileId = async (userId) => {
  const { data: profile } = await supabaseAdmin
    .from('job_seeker_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  return profile?.id;
};

const getAllSkills = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMySkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileId = await getProfileId(userId);
    if (!profileId) return res.status(404).json({ error: 'Profile not found' });

    const { data, error } = await supabaseAdmin
      .from('user_skills')
      .select('*, skills(*)')
      .eq('job_seeker_profile_id', profileId);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMySkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillName, proficiency, yearsOfExperience } = req.body;
    if (!skillName) {
      return res.status(400).json({ error: 'skillName is required' });
    }
    const profileId = await getProfileId(userId);
    if (!profileId) return res.status(404).json({ error: 'Profile not found' });

    // Find or create skill
    let skillId = null;
    const { data: existing } = await supabaseAdmin
      .from('skills').select('id').ilike('name', skillName).limit(1);

    if (existing && existing.length > 0) {
      skillId = existing[0].id;
    } else {
      const { data: newSkill, error: insErr } = await supabaseAdmin
        .from('skills').insert({ name: skillName, category: 'other' }).select('id').single();
      if (insErr) throw insErr;
      if (newSkill) skillId = newSkill.id;
    }

    // Insert user skill
    const { data, error } = await supabaseAdmin
      .from('user_skills')
      .upsert({
        job_seeker_profile_id: profileId,
        skill_id: skillId,
        proficiency: proficiency || 'intermediate',
        years_of_experience: yearsOfExperience || 1,
        source: 'manual',
        added_at: new Date().toISOString()
      }, { onConflict: 'job_seeker_profile_id,skill_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllSkills, getMySkills, addMySkill };
