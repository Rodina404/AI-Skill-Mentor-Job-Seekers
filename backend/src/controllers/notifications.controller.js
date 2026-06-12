const { supabaseAdmin } = require('../config/supabase');

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('getUserNotifications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
};

module.exports = { getUserNotifications };
