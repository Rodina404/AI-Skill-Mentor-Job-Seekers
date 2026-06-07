'use strict';

/**
 * supabase.js
 * -----------
 * Supabase client setup for the AI Skill Mentor Node.js backend.
 *
 * Exports:
 *   supabase      – anon/public client (respects RLS; use for user-scoped ops)
 *   supabaseAdmin – service-role client (bypasses RLS; use for server writes)
 *
 * Usage:
 *   const { supabase, supabaseAdmin } = require('./config/supabase');
 */

const { createClient } = require('@supabase/supabase-js');

// ---------------------------------------------------------------------------
// Validate required environment variables at startup
// ---------------------------------------------------------------------------
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `[supabase.js] Missing required environment variable(s): ${missing.join(', ')}.\n` +
    'Copy server/config/supabase.example.env → backend/.env and fill in the values.\n' +
    'Find them in: Supabase Dashboard → Project Settings → API.'
  );
}

const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY        = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------------------------------------------------------------------------
// Public / anon client  ─ respects Row Level Security
// Use this when acting on behalf of an authenticated user.
// Pass the user's JWT via supabase.auth.setSession() or per-request headers.
// ---------------------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Disable automatic session storage on the server side
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------------------------
// Admin / service-role client  ─ bypasses Row Level Security
// Use ONLY for server-side operations that must cross user boundaries:
//   • Writing candidate_matches (M4 microservice results)
//   • Writing course_recommendations (M5 microservice results)
//   • Writing roadmaps and progress_logs for a new user
//   • Generating signed Storage URLs for CV download
//
// NEVER expose this client or its key to the browser / front-end.
// ---------------------------------------------------------------------------
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

module.exports = { supabase, supabaseAdmin };
