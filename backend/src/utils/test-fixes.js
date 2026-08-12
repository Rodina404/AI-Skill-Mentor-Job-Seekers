/**
 * Test script for Fix 1 (Ask AI Why) and Fix 2 (Check My Fit)
 * Prerequisites: Express backend on :5000, M5 roadmap on :8005
 * Run from: backend/ directory  (node src/utils/test-fixes.js)
 */
const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const API = 'http://localhost:5000/api';
const EMAIL = 'flowtest@gmail.com';
const PASSWORD = 'Test1234!';

let passed = 0;
let failed = 0;

function ok(label) { passed++; console.log(`  ✅ ${label}`); }
function fail(label, err) { failed++; console.error(`  ❌ ${label}:`, typeof err === 'string' ? err : (err?.response?.data || err?.message || err)); }

async function run() {
  // ── Step 0: Login ──
  console.log('\n══ Step 0: Authentication ══');
  let token;
  try {
    const res = await axios.post(`${API}/auth/login`, { email: EMAIL, password: PASSWORD });
    token = res.data.access_token;
    if (!token) throw new Error('No access_token in response');
    ok(`Logged in as ${EMAIL} — token ${token.slice(0, 20)}...`);
  } catch (err) {
    fail('Login', err);
    console.error('\n🛑 Cannot proceed without auth. Exiting.');
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // ── Test 1: Ask AI Why (POST /roadmap/explain) ──
  console.log('\n══ Test 1: Ask AI Why — POST /api/roadmap/explain ══');
  try {
    const body = {
      skill: 'React',
      course_title: 'Advanced React Patterns'
    };
    console.log('  → Sending:', JSON.stringify(body));
    const res = await axios.post(`${API}/roadmap/explain`, body, { headers, timeout: 20000 });
    console.log('  ← Status:', res.status);
    console.log('  ← Body:', JSON.stringify(res.data, null, 2));

    if (res.data.success && res.data.data) {
      ok('Got success=true with data');
      if (res.data.data.why_skill) ok(`why_skill: "${res.data.data.why_skill.slice(0, 80)}..."`);
      else fail('why_skill missing');
      if (res.data.data.why_course) ok(`why_course: "${res.data.data.why_course.slice(0, 80)}..."`);
      else fail('why_course missing');
    } else {
      fail('Unexpected response shape', JSON.stringify(res.data));
    }
  } catch (err) {
    fail('POST /roadmap/explain', err);
  }

  // ── Test 2: Check My Fit (POST /matches/run) ──
  console.log('\n══ Test 2: Check My Fit — POST /api/matches/run ══');

  let resumeId, jobId;

  // Get user's resumes
  try {
    const resumeRes = await axios.get(`${API}/resume`, { headers });
    const body = resumeRes.data;
    // Could be array or { resumes: [...] }
    const resumes = Array.isArray(body) ? body : (body.resumes || body.data || []);
    if (resumes.length > 0) {
      resumeId = resumes[0].id;
      ok(`Found resume: ${resumeId}`);
    } else {
      fail('No resumes found for user', 'empty');
    }
  } catch (err) {
    fail('GET /resume', err);
  }

  // Get a job posting  — response shape is { success, data: { jobs: [...] } }
  try {
    const jobsRes = await axios.get(`${API}/jobs`, { headers });
    const body = jobsRes.data;
    const jobs = body?.data?.jobs || body?.jobs || (Array.isArray(body) ? body : []);
    if (jobs.length > 0) {
      jobId = jobs[0].id;
      ok(`Found job: ${jobId} — "${jobs[0].title || jobs[0].job_title}"`);
    } else {
      fail('No jobs found', 'empty result');
    }
  } catch (err) {
    fail('GET /jobs', err);
  }

  if (resumeId && jobId) {
    try {
      console.log(`  → Matching resume ${resumeId} vs job ${jobId}`);
      const res = await axios.post(`${API}/matches/run`,
        { resume_id: resumeId, job_id: jobId },
        { headers, timeout: 120000 }
      );
      console.log('  ← Status:', res.status);
      const data = res.data;
      console.log('  ← Top-level keys:', Object.keys(data));

      if (data.match_score !== undefined) ok(`match_score: ${data.match_score}`);
      if (data.readiness_score !== undefined) ok(`readiness_score: ${data.readiness_score}`);
      if (data.matched_skills) ok(`matched_skills (${data.matched_skills.length}): [${data.matched_skills.slice(0, 5).join(', ')}]`);
      if (data.missing_skills) ok(`missing_skills (${data.missing_skills.length}): [${data.missing_skills.slice(0, 5).join(', ')}]`);
      if (data.errors && data.errors.length) {
        console.log('  ⚠ Pipeline partial errors:', JSON.stringify(data.errors, null, 2));
      }

      if (!data.match_score && !data.readiness_score && !data.matched_skills) {
        console.log('  ← Full response (first 1500 chars):', JSON.stringify(data, null, 2).slice(0, 1500));
      }
    } catch (err) {
      fail('POST /matches/run', err);
    }
  } else {
    console.log('  ⚠ Skipping match test — missing resume or job ID');
  }

  // ── Test 3: Query Supabase for proof ──
  console.log('\n══ Test 3: Supabase Proof Queries ══');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check candidate_matches table (uses job_posting_id, not job_id)
    try {
      const { data, error } = await supabase
        .from('candidate_matches')
        .select('id, user_id, job_posting_id, match_score, overall_score, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      if (data && data.length > 0) {
        ok(`candidate_matches: ${data.length} recent rows`);
        data.forEach(r => console.log(`    id=${r.id}, overall=${r.overall_score}, match=${r.match_score}, created=${r.created_at}`));
      } else {
        console.log('  ⚠ No candidate_matches rows (normal if first run)');
      }
    } catch (err) {
      fail('Query candidate_matches', err);
    }

    // Check roadmaps table
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('id, user_id, resume_id, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      if (data && data.length > 0) {
        ok(`roadmaps: ${data.length} recent rows`);
        data.forEach(r => console.log(`    id=${r.id}, user=${r.user_id}, created=${r.created_at}`));
      } else {
        console.log('  ⚠ No roadmaps rows');
      }
    } catch (err) {
      fail('Query roadmaps', err);
    }
  } catch (err) {
    fail('Supabase client setup', err);
  }

  // ── Summary ──
  console.log('\n══════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

run();
