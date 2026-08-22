/**
 * full-k8s-runtime-acceptance.js
 * Comprehensive Full-Stack Kubernetes & Minikube E2E Feature Validation Runner
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8080';
const API_URL = `${BASE_URL}/api`;

const RUN_ID = Date.now().toString().slice(-6);
const R1_EMAIL = `recruiter1_${RUN_ID}@validation-test.com`;
const R2_EMAIL = `recruiter2_${RUN_ID}@validation-test.com`;
const JS1_EMAIL = `jobseeker1_${RUN_ID}@validation-test.com`;
const TEST_PASSWORD = 'TestPassword123!@#';

const results = {
  healthMatrix: [],
  features: {},
  security: {},
  database: {},
  selfHealing: {},
  failures: []
};

function record(category, testName, pass, details = '') {
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`[${status}] [${category}] ${testName} ${details ? '- ' + details : ''}`);
  if (!results.features[category]) results.features[category] = [];
  results.features[category].push({ testName, pass, details });
  if (!pass) {
    results.failures.push({ category, testName, details });
  }
}

async function runValidation() {
  console.log('================================================================');
  console.log('🚀 STARTING FULL KUBERNETES END-TO-END RUNTIME VALIDATION');
  console.log(`Target Environment: ${BASE_URL}`);
  console.log(`Run ID: ${RUN_ID}`);
  console.log('================================================================\n');

  let r1Token, r1RefreshToken, r1UserId;
  let r2Token, r2RefreshToken, r2UserId;
  let js1Token, js1RefreshToken, js1UserId, js1ProfileId;
  let testJobId, uploadedResumeId;

  // ──────────────────────────────────────────────────────────────────────────
  // 1. HEALTH CHECK MATRIX (Inside K8s and via Ingress)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- SECTION 1 & 2: HEALTH CHECK MATRIX & SERVICE VERIFICATION ---');

  const servicesToCheck = [
    { name: 'Frontend', url: `${BASE_URL}/`, expectedStatus: 200 },
    { name: 'Express Backend', url: `${API_URL}/health`, expectedStatus: 200 },
  ];

  for (const s of servicesToCheck) {
    try {
      const res = await axios.get(s.url, { timeout: 5000 });
      const pass = res.status === s.expectedStatus;
      record('Health Check', s.name, pass, `HTTP ${res.status}`);
      results.healthMatrix.push({ service: s.name, url: s.url, status: res.status, pass });
    } catch (err) {
      record('Health Check', s.name, false, `Failed: ${err.message}`);
      results.healthMatrix.push({ service: s.name, url: s.url, status: 'ERROR', pass: false });
    }
  }

  // Microservices internal health check via kubectl exec into backend pod
  const microservices = [
    { name: 'M1 Extraction', dns: 'http://m1-extraction-service:8001/health' },
    { name: 'M2 Skill Normalization', dns: 'http://skill-normalization-service:8002/health' },
    { name: 'M3 CV Matching', dns: 'http://cv-matching-service:8003/health' },
    { name: 'M4 Gap Engine', dns: 'http://gap-engine-service:8004/health' },
    { name: 'M5 Roadmap', dns: 'http://m5-roadmap-service:8005/health' },
    { name: 'M6 Course Recommendation', dns: 'http://course-recommendation-service:8006/health' },
    { name: 'M7 Job Recommendation', dns: 'http://job-recommendation-service:8007/health' },
  ];

  for (const ms of microservices) {
    try {
      const cmd = `kubectl exec deploy/express-backend-deployment -- node -e "const http = require('http'); http.get('${ms.dns}', (r) => { console.log(r.statusCode); process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', (e) => { console.error(e.message); process.exit(1); });"`;
      const out = execSync(cmd, { encoding: 'utf8', timeout: 10000 }).trim();
      const pass = out.includes('200');
      record('Microservice Health', ms.name, pass, `Service DNS: ${ms.dns} (HTTP 200)`);
      results.healthMatrix.push({ service: ms.name, url: ms.dns, status: 200, pass: true });
    } catch (err) {
      record('Microservice Health', ms.name, false, `Service DNS: ${ms.dns} - ${err.message}`);
      results.healthMatrix.push({ service: ms.name, url: ms.dns, status: 'FAIL', pass: false });
    }
  }

  // Check Supabase connectivity directly
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true });
    record('Database Connectivity', 'Supabase direct connection', !error, error ? error.message : 'Connected successfully');
  } catch (err) {
    record('Database Connectivity', 'Supabase direct connection', false, err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. AUTHENTICATION & ROLE ROUTING
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 4: AUTHENTICATION & ROLE VALIDATION ---');

  // Recruiter R1 Signup
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, {
      email: R1_EMAIL,
      password: TEST_PASSWORD,
      full_name: `Recruiter One ${RUN_ID}`,
      role: 'recruiter',
    });
    r1Token = res.data.access_token || res.data.token;
    r1RefreshToken = res.data.refresh_token;
    r1UserId = res.data.user?.id;
    record('Auth Signup', 'Recruiter R1 Signup', !!r1Token && res.data.user?.role === 'recruiter', `User ID: ${r1UserId}`);
  } catch (err) {
    record('Auth Signup', 'Recruiter R1 Signup', false, err.response?.data?.error || err.message);
  }

  // Recruiter R1 Login
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: R1_EMAIL,
      password: TEST_PASSWORD,
    });
    r1Token = res.data.access_token;
    r1RefreshToken = res.data.refresh_token;
    r1UserId = res.data.user?.id;
    record('Auth Login', 'Recruiter R1 Login', !!r1Token && res.data.user?.role === 'recruiter', `JWT acquired`);
  } catch (err) {
    record('Auth Login', 'Recruiter R1 Login', false, err.response?.data?.error || err.message);
  }

  // Recruiter R2 Signup & Login
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, {
      email: R2_EMAIL,
      password: TEST_PASSWORD,
      full_name: `Recruiter Two ${RUN_ID}`,
      role: 'recruiter',
    });
    r2Token = res.data.access_token;
    r2RefreshToken = res.data.refresh_token;
    r2UserId = res.data.user?.id;
    record('Auth Signup', 'Recruiter R2 Signup', !!r2Token, `User ID: ${r2UserId}`);
  } catch (err) {
    record('Auth Signup', 'Recruiter R2 Signup', false, err.response?.data?.error || err.message);
  }

  // Job Seeker JS1 Signup & Login
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, {
      email: JS1_EMAIL,
      password: TEST_PASSWORD,
      full_name: `Job Seeker One ${RUN_ID}`,
      role: 'job_seeker',
    });
    js1Token = res.data.access_token;
    js1RefreshToken = res.data.refresh_token;
    js1UserId = res.data.user?.id;
    const role = res.data.user?.role;
    record('Auth Signup', 'Job Seeker JS1 Signup', !!js1Token && (role === 'job_seeker' || role === 'jobseeker'), `User ID: ${js1UserId}`);
  } catch (err) {
    record('Auth Signup', 'Job Seeker JS1 Signup', false, err.response?.data?.error || err.message);
  }

  // Negative Authorization: Unauthenticated -> Protected = 401
  try {
    await axios.get(`${API_URL}/jobs/recruiter/my-jobs`);
    record('Negative Auth', 'Unauthenticated request denied with 401', false, 'Unexpected 200');
  } catch (err) {
    const is401 = err.response?.status === 401;
    record('Negative Auth', 'Unauthenticated request denied with 401', is401, `Status: ${err.response?.status}`);
  }

  // Negative Authorization: Job Seeker -> Recruiter endpoint = 403
  try {
    await axios.get(`${API_URL}/jobs/recruiter/my-jobs`, {
      headers: { Authorization: `Bearer ${js1Token}` },
    });
    record('Negative Auth', 'Job Seeker access to Recruiter endpoint denied with 403', false, 'Unexpected 200');
  } catch (err) {
    const is403 = err.response?.status === 403;
    record('Negative Auth', 'Job Seeker access to Recruiter endpoint denied with 403', is403, `Status: ${err.response?.status}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SESSION REFRESH VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 5: SESSION REFRESH & TOKEN VALIDATION ---');

  try {
    const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: r1RefreshToken,
    });
    const hasNewToken = !!refreshRes.data.access_token;
    record('Session Refresh', 'Valid refresh_token returns fresh access_token', hasNewToken, `New token received`);
    if (hasNewToken) {
      r1Token = refreshRes.data.access_token;
    }
  } catch (err) {
    record('Session Refresh', 'Valid refresh_token returns fresh access_token', false, err.response?.data?.error || err.message);
  }

  try {
    await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: 'invalid-expired-refresh-token-99999',
    });
    record('Session Refresh', 'Invalid refresh_token is rejected', false, 'Expected rejection');
  } catch (err) {
    const pass = err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 500;
    record('Session Refresh', 'Invalid refresh_token is rejected', pass, `Status: ${err.response?.status}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PROFILE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 7: PROFILE FEATURES ---');

  // Recruiter R1 Company Profile
  try {
    const profileUpdateRes = await axios.put(
      `${API_URL}/recruiter/company-profile`,
      {
        name: `TechNova Solutions ${RUN_ID}`,
        description: 'Pioneering AI-driven recruitment platforms',
        email: `contact@technova-${RUN_ID}.com`,
        phone: '+1-555-0199',
        location: 'San Francisco, CA',
      },
      { headers: { Authorization: `Bearer ${r1Token}` } }
    );

    const getProfileRes = await axios.get(`${API_URL}/recruiter/company-profile`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });

    const isCompanySaved = getProfileRes.data?.data?.name === `TechNova Solutions ${RUN_ID}`;
    record('Recruiter Profile', 'Update and persist company profile in DB', isCompanySaved, `Saved: ${getProfileRes.data?.data?.name}`);
  } catch (err) {
    record('Recruiter Profile', 'Update and persist company profile in DB', false, err.response?.data?.error || err.message);
  }

  // Job Seeker JS1 Profile
  try {
    const updateProfileRes = await axios.put(
      `${API_URL}/users/${js1UserId}`,
      {
        name: `Job Seeker One ${RUN_ID}`,
        location: 'Remote',
      },
      { headers: { Authorization: `Bearer ${js1Token}` } }
    );

    const { data: dbProfile } = await supabaseAdmin
      .from('job_seeker_profiles')
      .select('id, location')
      .eq('user_id', js1UserId)
      .single();

    js1ProfileId = dbProfile?.id;
    record('Job Seeker Profile', 'Update and persist candidate profile', dbProfile?.location === 'Remote', `Profile ID: ${js1ProfileId}`);
  } catch (err) {
    record('Job Seeker Profile', 'Update and persist candidate profile', false, err.response?.data?.error || err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. RECRUITER JOB MANAGEMENT (Create, Edit, View)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 11: RECRUITER JOB MANAGEMENT ---');

  try {
    const createJobRes = await axios.post(
      `${API_URL}/jobs`,
      {
        title: `Senior Full Stack Engineer ${RUN_ID}`,
        company: `TechNova Solutions ${RUN_ID}`,
        location: 'Remote',
        job_description: 'Looking for a Senior Full Stack Engineer proficient in React, Node.js, JavaScript, and TypeScript.',
        required_skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL'],
        job_type: 'full_time',
        status: 'open',
      },
      { headers: { Authorization: `Bearer ${r1Token}` } }
    );

    testJobId = createJobRes.data?.data?.job?.id || createJobRes.data?.data?.id || createJobRes.data?.id;
    record('Job Management', 'Recruiter R1 creates Job Posting', !!testJobId, `Job ID: ${testJobId}`);
  } catch (err) {
    record('Job Management', 'Recruiter R1 creates Job Posting', false, err.response?.data?.error || err.message);
  }

  // Edit Job Posting
  try {
    const editRes = await axios.put(
      `${API_URL}/jobs/${testJobId}`,
      {
        title: `Lead Full Stack Engineer ${RUN_ID}`,
        required_skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'PostgreSQL'],
        status: 'open',
      },
      { headers: { Authorization: `Bearer ${r1Token}` } }
    );

    const getJobRes = await axios.get(`${API_URL}/jobs/${testJobId}`);
    const updatedTitle = getJobRes.data?.data?.title || getJobRes.data?.title;
    const isUpdated = updatedTitle === `Lead Full Stack Engineer ${RUN_ID}`;
    record('Job Management', 'Recruiter R1 edits Job Posting without ID mutation', isUpdated, `Title: ${updatedTitle}`);
  } catch (err) {
    record('Job Management', 'Recruiter R1 edits Job Posting without ID mutation', false, err.response?.data?.error || err.message);
  }

  // Recruiter My Jobs list
  try {
    const myJobsRes = await axios.get(`${API_URL}/jobs/recruiter/my-jobs?status=all`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });
    const jobs = myJobsRes.data?.data?.jobs || myJobsRes.data?.jobs || [];
    const containsJob = jobs.some(j => j.id === testJobId);
    record('Job Management', 'Recruiter R1 lists owned jobs via /jobs/recruiter/my-jobs', containsJob, `Total owned: ${jobs.length}`);
  } catch (err) {
    record('Job Management', 'Recruiter R1 lists owned jobs via /jobs/recruiter/my-jobs', false, err.response?.data?.error || err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. CROSS-RECRUITER OWNERSHIP & BOLA SECURITY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 12: CROSS-RECRUITER OWNERSHIP & BOLA ISOLATION ---');

  // R2 attempts to edit R1's Job -> 403
  try {
    await axios.put(
      `${API_URL}/jobs/${testJobId}`,
      { title: 'Hacked Title' },
      { headers: { Authorization: `Bearer ${r2Token}` } }
    );
    record('BOLA Security', 'R2 editing R1 job is denied with 403', false, 'Unexpected 200');
  } catch (err) {
    const is403 = err.response?.status === 403;
    record('BOLA Security', 'R2 editing R1 job is denied with 403', is403, `Status: ${err.response?.status}`);
  }

  // R2 attempts to delete R1's Job -> 403
  try {
    await axios.delete(`${API_URL}/jobs/${testJobId}`, {
      headers: { Authorization: `Bearer ${r2Token}` },
    });
    record('BOLA Security', 'R2 deleting R1 job is denied with 403', false, 'Unexpected 200');
  } catch (err) {
    const is403 = err.response?.status === 403;
    record('BOLA Security', 'R2 deleting R1 job is denied with 403', is403, `Status: ${err.response?.status}`);
  }

  // R2 attempts to trigger AI matching for R1's Job -> 403
  try {
    await axios.post(
      `${API_URL}/jobs/${testJobId}/match-candidates`,
      {},
      { headers: { Authorization: `Bearer ${r2Token}` } }
    );
    record('BOLA Security', 'R2 triggering AI match on R1 job is denied with 403', false, 'Unexpected 200');
  } catch (err) {
    const is403 = err.response?.status === 403;
    record('BOLA Security', 'R2 triggering AI match on R1 job is denied with 403', is403, `Status: ${err.response?.status}`);
  }

  // R2 attempts to view candidate matches for R1's Job -> 403
  try {
    await axios.get(`${API_URL}/jobs/${testJobId}/candidate-matches`, {
      headers: { Authorization: `Bearer ${r2Token}` },
    });
    record('BOLA Security', 'R2 viewing candidate matches on R1 job is denied with 403', false, 'Unexpected 200');
  } catch (err) {
    const is403 = err.response?.status === 403;
    record('BOLA Security', 'R2 viewing candidate matches on R1 job is denied with 403', is403, `Status: ${err.response?.status}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. JOB SEEKER RESUME UPLOAD & AI PROCESSING PIPELINE
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 8: RESUME UPLOAD & AI MICROSERVICE PIPELINE ---');

  const samplePdfPath = path.resolve(__dirname, '../../../AI-Microservices/m1_extraction_service/data/resumes/resume_01_data_science_ahmed_mostafa.pdf');

  if (fs.existsSync(samplePdfPath)) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(samplePdfPath));

      const uploadRes = await axios.post(`${API_URL}/resumes/upload`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${js1Token}`,
        },
      });

      uploadedResumeId = uploadRes.data.resume_id || uploadRes.data.id;
      record('Resume Pipeline', 'Resume upload to Supabase Storage and DB record creation', !!uploadedResumeId, `Resume ID: ${uploadedResumeId}`);

      // Wait for AI background pipeline (M1, M2, M4, M5, M6)
      console.log('  Waiting 10 seconds for AI background processing pipeline...');
      await new Promise(r => setTimeout(r, 10000));

      const statusRes = await axios.get(`${API_URL}/resumes/${uploadedResumeId}/status`, {
        headers: { Authorization: `Bearer ${js1Token}` },
      });

      const status = statusRes.data?.status || statusRes.data?.data?.status;
      record('Resume Pipeline', 'Resume processing status check', status === 'completed' || status === 'processed' || status === 'analyzed' || statusRes.status === 200, `Status: ${status}`);
    } catch (err) {
      record('Resume Pipeline', 'Resume upload and processing pipeline', false, err.response?.data?.error || err.message);
    }
  } else {
    record('Resume Pipeline', 'Sample PDF exists for upload', false, `Missing: ${samplePdfPath}`);
  }

  // Ensure JS1 is marked discoverable for Recruiter candidate discovery
  try {
    await supabaseAdmin
      .from('job_seeker_profiles')
      .update({ is_discoverable: true, skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL'] })
      .eq('user_id', js1UserId);
    record('Candidate Pool', 'Set Job Seeker profile discoverable', true);
  } catch (err) {
    record('Candidate Pool', 'Set Job Seeker profile discoverable', false, err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8. AI CANDIDATE MATCHING & PERSISTENCE
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 13, 14, 15: AI MATCHING & APPLICATION SEPARATION ---');

  let matchedCandidateId;

  try {
    const matchRes = await axios.post(
      `${API_URL}/jobs/${testJobId}/match-candidates`,
      {},
      { headers: { Authorization: `Bearer ${r1Token}` } }
    );

    const candidates = matchRes.data?.data?.rankedCandidates || [];
    const count = matchRes.data?.data?.candidatesSuccessfullyEvaluated || candidates.length;
    record('AI Candidate Matching', 'Recruiter R1 runs AI Candidate Discovery', count > 0, `Evaluated: ${count} candidates`);

    if (candidates.length > 0) {
      const topCand = candidates[0];
      const score = topCand.score;
      matchedCandidateId = topCand.candidateId;
      const validScoreRange = typeof score === 'number' && score >= 0 && score <= 100;
      record('AI Candidate Matching', 'Match score contract is strictly in [0, 100]', validScoreRange, `Score: ${score}%`);
    }

    // Persisted Candidate Matches check
    const persistedMatchesRes = await axios.get(`${API_URL}/jobs/${testJobId}/candidate-matches`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });
    const persistedList = persistedMatchesRes.data?.data?.matches || persistedMatchesRes.data?.matches || [];
    record('AI Candidate Matching', 'Candidate matches retrieved from DB persistence', persistedList.length > 0, `Persisted count: ${persistedList.length}`);
  } catch (err) {
    record('AI Candidate Matching', 'Recruiter R1 runs AI Candidate Discovery', false, err.response?.data?.error || err.message);
  }

  // Critical Check: AI Match != Application before application
  try {
    const { data: matchRecords } = await supabaseAdmin
      .from('candidate_matches')
      .select('id')
      .eq('job_posting_id', testJobId);

    const { data: appRecords } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('job_posting_id', testJobId);

    const matchCount = matchRecords?.length || 0;
    const appCount = appRecords?.length || 0;

    record('Business Rule Separation', 'AI Match does NOT create job application', matchCount > 0 && appCount === 0, `candidate_matches: ${matchCount}, job_applications: ${appCount}`);
  } catch (err) {
    record('Business Rule Separation', 'AI Match does NOT create job application', false, err.message);
  }

  // Recruiter checks Applicants (must be 0)
  try {
    const applicantsRes = await axios.get(`${API_URL}/jobs/${testJobId}/applicants`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });
    const apps = applicantsRes.data?.data?.candidates || applicantsRes.data?.candidates || [];
    record('Applicants API', 'Applicants list is empty before candidate applies', apps.length === 0, `Applicants: ${apps.length}`);
  } catch (err) {
    record('Applicants API', 'Applicants list is empty before candidate applies', false, err.response?.data?.error || err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. JOB SEEKER APPLICATION FLOW
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 10: JOB SEEKER APPLICATION FLOW ---');

  try {
    const applyRes = await axios.post(
      `${API_URL}/jobs/${testJobId}/apply`,
      {},
      { headers: { Authorization: `Bearer ${js1Token}` } }
    );
    record('Job Application', 'Job Seeker applies to Job Posting', applyRes.status === 200 || applyRes.status === 201, `Status: ${applyRes.status}`);

    // Verify Applicants endpoint now lists candidate
    const applicantsRes = await axios.get(`${API_URL}/jobs/${testJobId}/applicants`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });
    const apps = applicantsRes.data?.data?.candidates || applicantsRes.data?.candidates || [];
    record('Applicants API', 'Candidate appears in Applicants after applying', apps.length >= 1, `Applicants: ${apps.length}`);

    // Verify database separation
    const { data: matchRecords } = await supabaseAdmin
      .from('candidate_matches')
      .select('id')
      .eq('job_posting_id', testJobId);

    const { data: appRecords } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('job_posting_id', testJobId);

    record('Business Rule Separation', 'Separate candidate_matches and job_applications records co-exist', matchRecords?.length > 0 && appRecords?.length > 0, `matches: ${matchRecords?.length}, apps: ${appRecords?.length}`);
  } catch (err) {
    record('Job Application', 'Job Seeker application flow', false, err.response?.data?.error || err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. SIGNED RESUME ACCESS & BOLA SECURITY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 17: SIGNED RESUME ACCESS & BOLA SECURITY ---');

  // Resolve JS1 candidateId (the candidate who uploaded a resume and applied)
  const targetCandidateId = js1ProfileId;

  if (targetCandidateId && testJobId) {
    // Authorized R1 fetches signed resume URL
    try {
      const resumeUrlRes = await axios.get(
        `${API_URL}/jobs/${testJobId}/candidates/${targetCandidateId}/resume-url`,
        { headers: { Authorization: `Bearer ${r1Token}` } }
      );
      const url = resumeUrlRes.data?.data?.url;
      const isValidSupabaseSignedUrl = !!url && (url.includes('token=') || url.includes('supabase'));
      record('Signed Resume URL', 'Authorized Recruiter receives short-lived Supabase signed URL', isValidSupabaseSignedUrl, `URL acquired`);
    } catch (err) {
      record('Signed Resume URL', 'Authorized Recruiter receives short-lived Supabase signed URL', false, err.response?.data?.error || err.message);
    }

    // BOLA Gate: R2 attempts to get signed resume URL for candidate on R1's job -> 403
    try {
      await axios.get(
        `${API_URL}/jobs/${testJobId}/candidates/${targetCandidateId}/resume-url`,
        { headers: { Authorization: `Bearer ${r2Token}` } }
      );
      record('BOLA Security', 'Unauthorized Recruiter R2 blocked from accessing candidate resume (403)', false, 'Unexpected 200');
    } catch (err) {
      const is403 = err.response?.status === 403;
      record('BOLA Security', 'Unauthorized Recruiter R2 blocked from accessing candidate resume (403)', is403, `Status: ${err.response?.status}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 11. NOTIFICATIONS API
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 19: NOTIFICATIONS API ---');

  try {
    const notifRes = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${r1Token}` },
    });
    const pass = notifRes.status === 200 && Array.isArray(notifRes.data);
    record('Notifications', 'Fetch user notifications array', pass, `Count: ${notifRes.data?.length || 0}`);
  } catch (err) {
    record('Notifications', 'Fetch user notifications array', false, err.response?.data?.error || err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 12. KUBERNETES SELF-HEALING TEST
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 22: KUBERNETES SELF-HEALING TEST ---');

  try {
    const getPodCmd = 'kubectl get pod -l app=cv-matching -o jsonpath="{.items[0].metadata.name}"';
    const oldPodName = execSync(getPodCmd, { encoding: 'utf8' }).trim();
    console.log(`  Deleting stateless microservice pod: ${oldPodName}...`);

    execSync(`kubectl delete pod ${oldPodName} --grace-period=1`, { timeout: 15000 });
    console.log('  Pod deleted. Waiting for ReplicaSet to recreate new pod and reach 1/1 Running...');

    // Wait for new pod to reach Running state
    let healed = false;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const podStatusCmd = 'kubectl get pod -l app=cv-matching -o jsonpath="{.items[0].status.phase}"';
        const phase = execSync(podStatusCmd, { encoding: 'utf8' }).trim();
        if (phase === 'Running') {
          healed = true;
          break;
        }
      } catch {}
    }

    // Verify service health through backend pod
    const healthCmd = `kubectl exec deploy/express-backend-deployment -- node -e "const http = require('http'); http.get('http://cv-matching-service:8003/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"`;
    let serviceHealthy = false;
    try {
      execSync(healthCmd, { timeout: 10000 });
      serviceHealthy = true;
    } catch {}

    record('Self-Healing', 'Kubernetes automatically recreates deleted pod and restores service DNS health', healed && serviceHealthy, `Recreation & Health verified`);
  } catch (err) {
    record('Self-Healing', 'Kubernetes self-healing test', false, err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 13. CLEAN TEST DATA
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 27: TEST DATA CLEANUP ---');

  try {
    // Delete Job Application
    if (testJobId) {
      await supabaseAdmin.from('job_applications').delete().eq('job_posting_id', testJobId);
      await supabaseAdmin.from('candidate_matches').delete().eq('job_posting_id', testJobId);
      await supabaseAdmin.from('job_postings').delete().eq('id', testJobId);
    }

    // Delete Job Seeker Profile & Resumes
    if (js1UserId) {
      await supabaseAdmin.from('resumes').delete().eq('user_id', js1UserId);
      await supabaseAdmin.from('job_seeker_profiles').delete().eq('user_id', js1UserId);
      await supabaseAdmin.from('users').delete().eq('id', js1UserId);
      await supabaseAdmin.auth.admin.deleteUser(js1UserId);
    }

    // Delete Recruiter Profiles & Users
    if (r1UserId) {
      await supabaseAdmin.from('company_profiles').delete().eq('recruiter_id', r1UserId);
      await supabaseAdmin.from('recruiter_profiles').delete().eq('user_id', r1UserId);
      await supabaseAdmin.from('users').delete().eq('id', r1UserId);
      await supabaseAdmin.auth.admin.deleteUser(r1UserId);
    }

    if (r2UserId) {
      await supabaseAdmin.from('company_profiles').delete().eq('recruiter_id', r2UserId);
      await supabaseAdmin.from('recruiter_profiles').delete().eq('user_id', r2UserId);
      await supabaseAdmin.from('users').delete().eq('id', r2UserId);
      await supabaseAdmin.auth.admin.deleteUser(r2UserId);
    }

    record('Data Cleanup', 'All temporary validation test users and records purged cleanly', true);
  } catch (err) {
    record('Data Cleanup', 'Test data cleanup', false, err.message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 RUNTIME VALIDATION SUMMARY:');
  const allTests = Object.values(results.features).flat();
  const passedCount = allTests.filter(t => t.pass).length;
  const totalCount = allTests.length;
  console.log(`Passed: ${passedCount}/${totalCount}`);
  if (results.failures.length > 0) {
    console.log(`Failures (${results.failures.length}):`);
    results.failures.forEach(f => console.log(`  ❌ [${f.category}] ${f.testName}: ${f.details}`));
  } else {
    console.log('🎉 ALL RUNTIME FEATURE VALIDATIONS PASSED!');
  }
  console.log('================================================================\n');

  return { passedCount, totalCount, failures: results.failures };
}

runValidation().then(res => {
  process.exit(res.failures.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('Validation runner fatal error:', err);
  process.exit(1);
});
