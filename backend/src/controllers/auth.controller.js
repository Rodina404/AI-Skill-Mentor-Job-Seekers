const { supabase } = require('../config/supabase');

const signup = async (req, res) => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'email, password, and full_name are required' });

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, role: role || 'job_seeker' } }
  });
  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json({
    message: 'Account created. Please verify your email.',
    user: { id: data.user.id, email: data.user.email, full_name, role: role || 'job_seeker' }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials' });

  return res.status(200).json({
    message: 'Login successful',
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata?.full_name,
      role: data.user.user_metadata?.role || 'job_seeker'
    }
  });
};

const logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: 'Invalid or expired refresh token' });
  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at
  });
};

module.exports = { signup, login, logout, getMe, refreshToken };
