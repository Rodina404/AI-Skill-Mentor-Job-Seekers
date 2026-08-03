const { supabaseAdmin } = require('../config/supabase');

/**
 * Get recruiter company profile
 * GET /recruiter/company-profile
 */
const getCompanyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Recruiter access required' });
    }

    const { data, error } = await supabaseAdmin
      .from('company_profiles')
      .select('*')
      .eq('recruiter_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data: data || null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Create or update recruiter company profile
 * PUT /recruiter/company-profile
 */
const updateCompanyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Recruiter access required' });
    }

    const { name, description, email, phone, location } = req.body;

    const { data, error } = await supabaseAdmin
      .from('company_profiles')
      .upsert(
        {
          recruiter_id: req.user.id,
          name,
          description,
          email,
          phone,
          location,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'recruiter_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile
};
