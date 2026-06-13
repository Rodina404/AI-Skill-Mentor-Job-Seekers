const { supabase, supabaseAdmin } = require('../config/supabase');

const signup = async (req, res) => {
  const { email, password, full_name, role } = req.body;
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'email, password, and full_name are required' });

  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, role: role || 'job_seeker' } }
  });
  if (error) return res.status(400).json({ error: error.message });

  const responsePayload = {
    message: 'Account created. Please verify your email.',
    user: { id: data.user.id, email: data.user.email, full_name, role: role || 'job_seeker' }
  };

  if (data.session) {
    responsePayload.access_token = data.session.access_token;
    responsePayload.refresh_token = data.session.refresh_token;
    responsePayload.message = 'Account created and logged in successfully.';
  }

  return res.status(201).json(responsePayload);
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
  try {
    const userId = req.user.id;

    // Pull enriched name from public.users (populated by auth trigger)
    console.log('[getMe] Querying for userId:', userId);
    const { data: dbUser, error: dbUserError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, roles(name)')
      .eq('id', userId)
      .single();
    console.log('[getMe] dbUser result:', dbUser, 'error:', dbUserError);
    if (dbUserError) {
      console.error('[getMe] dbUser fetch error:', dbUserError.message);
    }

    // Pull job seeker profile (location, etc.)
    const { data: seekerProfile } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id, location, years_of_experience, target_role, headline, bio')
      .eq('user_id', userId)
      .single();

    const fullName = req.user.full_name || '';
    const enrichedUser = {
      id: userId,
      email: req.user.email,
      full_name: fullName,
      role: dbUser?.roles?.name || dbUser?.role || req.user.role,
      first_name: dbUser?.first_name || fullName.split(' ')[0] || '',
      last_name: dbUser?.last_name || fullName.split(' ').slice(1).join(' ') || '',
    };

    return res.status(200).json({ user: enrichedUser, profile: seekerProfile || null });
  } catch (err) {
    // Safe fallback — never let getMe return non-200 for a DB lookup failure
    const fullName = req.user.full_name || '';
    return res.status(200).json({
      user: {
        ...req.user,
        first_name: fullName.split(' ')[0] || '',
        last_name: fullName.split(' ').slice(1).join(' ') || '',
      },
      profile: null
    });
  }
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
