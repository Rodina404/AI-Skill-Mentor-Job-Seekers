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

const markNotificationRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Notification not found' });
    res.json(data);
  } catch (err) {
    console.error('markNotificationRead error:', err.message);
    res.status(500).json({ error: 'Failed to update notification', details: err.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();

    if (error) throw error;
    res.json({ message: 'All notifications marked as read', updated: (data || []).length });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err.message);
    res.status(500).json({ error: 'Failed to update notifications', details: err.message });
  }
};

module.exports = { getUserNotifications, markNotificationRead, markAllNotificationsRead };
