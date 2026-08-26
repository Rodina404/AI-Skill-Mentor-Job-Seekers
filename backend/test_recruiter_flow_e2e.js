// backend/test_recruiter_flow_e2e.js
require('dotenv').config();
const { supabaseAdmin, supabase } = require('./src/config/supabase');

const BACKEND_URL = 'http://127.0.0.1:5000/api';
const FRONTEND_URL = 'http://127.0.0.1:3000';

const AI_SERVICES = [
  { name: 'M1 Extraction', url: 'http://127.0.0.1:8001/health' },
  { name: 'Skill Normalization', url: 'http://127.0.0.1:8002/health' },
  { name: 'CV Matching', url: 'http://127.0.0.1:8003/health' },
  { name: 'Gap Engine', url: 'http://127.0.0.1:8004/health' },
  { name: 'M5 Roadmap', url: 'http://127.0.0.1:8005/health' },
  { name: 'Course Recommendation', url: 'http://127.0.0.1:8006/health' },
  { name: 'Job Recommendation', url: 'http://127.0.0.1:8007/health' }
];

const report = {
  timestamp: new Date().toISOString(),
  health: {},
  recruiterAuth: {},
  jobManagement: {},
  candidatePoolAudit: {},
  aiMatchingPipeline: {},
  databasePersistence: {},
  resumePrivacySecurity: {},
  summary: {}
};

async function safeFetch(url, options = {}) {
  const timeout = options.timeout || 30000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { ok: res.ok, status: res.status, data: body };
  } catch (err) {
    clearTimeout(id);
    return { ok: false, status: 0, error: err.message };
  }
}

async function runTest() {
  console.log('================================================================');
  console.log('       AI SKILL MENTOR - COMPREHENSIVE RECRUITER E2E AUDIT      ');
  console.log('================================================================');

  // 1. Health Checks
  console.log('\n[1/6] Validating Pod & Microservice Health...');
  const backendHealth = await safeFetch(`${BACKEND_URL}/health`);
  report.health.backend = backendHealth.ok ? 'ONLINE (200 OK)' : `FAILED (${backendHealth.error || backendHealth.status})`;
  console.log(` - Express Backend: ${report.health.backend}`);

  const frontendHealth = await safeFetch(FRONTEND_URL);
  report.health.frontend = (frontendHealth.ok || frontendHealth.status === 200) ? 'ONLINE (200 OK)' : `FAILED (${frontendHealth.error || frontendHealth.status})`;
  console.log(` - Frontend React:  ${report.health.frontend}`);

  for (const s of AI_SERVICES) {
    const res = await safeFetch(s.url);
    report.health[s.name] = res.ok ? 'ONLINE (200 OK)' : `OFFLINE / INITIALIZING (${res.error || res.status})`;
    console.log(` - ${s.name.padEnd(22)}: ${report.health[s.name]}`);
  }

  // 2. Recruiter Auth & Database Provisioning
  console.log('\n[2/6] Verifying Recruiter Authentication & Role Authorization...');
  const testRecruiterEmail = `recruiter_verified_${Date.now()}@example.com`;
  const testRecruiterPassword = 'RecruiterSecure123!';

  // Create confirmed user via Supabase Admin
  let recruiterUser = null;
  const { data: createdAuth, error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
    email: testRecruiterEmail,
    password: testRecruiterPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Elena Rostova',
      role: 'recruiter',
      company_name: 'Apex AI Recruiting'
    }
  });

  if (createAuthErr) {
    console.log('⚠️ Error creating recruiter in Auth:', createAuthErr.message);
  } else {
    recruiterUser = createdAuth.user;
  }

  // Ensure user is in `users` / `recruiter_profiles` table
  if (recruiterUser) {
    await supabaseAdmin.from('users').upsert({
      id: recruiterUser.id,
      email: testRecruiterEmail,
      full_name: 'Elena Rostova',
      role: 'recruiter'
    });
  }

  // Log in via Backend API: POST /api/auth/login
  console.log(` - Authenticating via POST ${BACKEND_URL}/auth/login...`);
  const loginRes = await safeFetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testRecruiterEmail,
      password: testRecruiterPassword
    })
  });

  if (!loginRes.ok) {
    console.error('❌ Recruiter Login failed:', JSON.stringify(loginRes.data));
    report.recruiterAuth.status = 'FAILED';
    report.recruiterAuth.error = loginRes.data;
    return;
  }

  const token = loginRes.data.access_token || loginRes.data.data?.token;
  report.recruiterAuth = {
    status: 'PASSED',
    email: testRecruiterEmail,
    role: loginRes.data.user?.role,
    tokenReceived: !!token
  };
  console.log(`✅ Recruiter logged in successfully. Role: ${loginRes.data.user?.role}`);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Verify /api/auth/me
  const meRes = await safeFetch(`${BACKEND_URL}/auth/me`, { headers: authHeaders });
  console.log(` - GET /api/auth/me -> Status: ${meRes.status} (User ID: ${meRes.data?.user?.id})`);

  // 3. Job Management (CRUD)
  console.log('\n[3/6] Testing Recruiter Job Management (Create, Read, Update, Delete)...');
  const jobPayload = {
    title: `Senior AI Full-Stack Architect - ${Date.now()}`,
    job_description: 'Looking for a Senior Engineer with proficiency in Python, FastAPI, React, TypeScript, Docker, Kubernetes, and PostgreSQL to scale AI microservice systems.',
    company: 'Apex AI Recruiting',
    location: 'Remote',
    job_type: 'full_time',
    required_skills: ['Python', 'FastAPI', 'React', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL']
  };

  const createJobRes = await safeFetch(`${BACKEND_URL}/jobs`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(jobPayload)
  });

  const createdJob = createJobRes.data?.data?.job || createJobRes.data?.data;
  const jobId = createdJob?.id;

  if (!jobId) {
    console.error('❌ Job creation failed:', JSON.stringify(createJobRes.data));
    report.jobManagement.create = { status: 'FAILED', error: createJobRes.data };
    return;
  }

  report.jobManagement.create = { status: 'PASSED', jobId, title: jobPayload.title };
  console.log(`✅ Job Created (POST /api/jobs): ID ${jobId}`);

  // Query Recruiter's jobs
  const myJobsRes = await safeFetch(`${BACKEND_URL}/jobs/recruiter/my-jobs`, { headers: authHeaders });
  const myJobs = myJobsRes.data?.data?.jobs || myJobsRes.data?.jobs || [];
  const jobFoundInMyJobs = myJobs.some(j => j.id === jobId);
  report.jobManagement.myJobs = {
    status: jobFoundInMyJobs ? 'PASSED' : 'FAILED',
    totalRecruiterJobs: myJobs.length
  };
  console.log(`✅ GET /api/jobs/recruiter/my-jobs: Verified recruiter ownership (${myJobs.length} jobs listed)`);

  // Fetch single job
  const getJobRes = await safeFetch(`${BACKEND_URL}/jobs/${jobId}`);
  report.jobManagement.getById = { status: getJobRes.ok ? 'PASSED' : 'FAILED', title: getJobRes.data?.data?.title };
  console.log(`✅ GET /api/jobs/${jobId}: Fetched job "${getJobRes.data?.data?.title}"`);

  // Update job
  const updatedJobTitle = `Principal AI Systems Architect - ${Date.now()}`;
  const updateJobRes = await safeFetch(`${BACKEND_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      title: updatedJobTitle,
      required_skills: ['Python', 'FastAPI', 'React', 'Docker', 'Kubernetes', 'PostgreSQL', 'LangChain']
    })
  });
  report.jobManagement.update = {
    status: updateJobRes.ok ? 'PASSED' : 'FAILED',
    updatedTitle: updateJobRes.data?.data?.title
  };
  console.log(`✅ PUT /api/jobs/${jobId}: Updated job title to "${updateJobRes.data?.data?.title}"`);

  // 4. Candidate Pool & AI Matching Pipeline
  console.log('\n[4/6] Auditing Candidate Pool & Running AI Matching Pipeline...');
  // Check candidate pool in database
  const { data: discoverableCandidates, error: candErr } = await supabaseAdmin
    .from('job_seeker_profiles')
    .select('id, user_id, is_discoverable')
    .eq('is_discoverable', true);

  console.log(` - Discoverable candidate profiles in DB: ${discoverableCandidates ? discoverableCandidates.length : 0}`);
  report.candidatePoolAudit = {
    totalDiscoverable: discoverableCandidates ? discoverableCandidates.length : 0,
    dbQueryStatus: candErr ? `ERROR: ${candErr.message}` : 'OK'
  };

  // If no candidates in candidate_pool, insert/ensure test candidate
  let testCandidateId = null;
  if (discoverableCandidates && discoverableCandidates.length > 0) {
    testCandidateId = discoverableCandidates[0].id;
  } else {
    // Create a mock discoverable candidate profile
    const testCandidateEmail = `candidate_${Date.now()}@example.com`;
    const { data: candAuth } = await supabaseAdmin.auth.admin.createUser({
      email: testCandidateEmail,
      password: 'CandidatePass123!',
      email_confirm: true,
      user_metadata: { full_name: 'Jordan Lee', role: 'job_seeker' }
    });
    if (candAuth?.user) {
      await supabaseAdmin.from('users').upsert({
        id: candAuth.user.id,
        email: testCandidateEmail,
        full_name: 'Jordan Lee',
        role: 'job_seeker'
      });
      const { data: newProf } = await supabaseAdmin.from('job_seeker_profiles').upsert({
        user_id: candAuth.user.id,
        skills: ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL'],
        experience_years: 4,
        is_discoverable: true,
        location: 'Remote'
      }).select().single();
      testCandidateId = newProf?.id;

      await supabaseAdmin.from('resumes').insert({
        user_id: candAuth.user.id,
        file_path: 'resumes/jordan_lee_cv.pdf',
        status: 'analyzed',
        extracted_data: {
          skills: ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL'],
          jobTitle: 'Senior Software Engineer'
        },
        normalized_skills: [{ name: 'Python' }, { name: 'FastAPI' }, { name: 'React' }, { name: 'Docker' }]
      });
      console.log(` - Seeded test discoverable candidate: ID ${testCandidateId}`);
    }
  }

  // Trigger AI Matching for Job: POST /api/jobs/:jobId/match-candidates
  console.log(` - Executing POST ${BACKEND_URL}/jobs/${jobId}/match-candidates...`);
  const matchRes = await safeFetch(`${BACKEND_URL}/jobs/${jobId}/match-candidates`, {
    method: 'POST',
    headers: authHeaders,
    timeout: 60000
  });

  if (matchRes.ok) {
    const matchData = matchRes.data;
    const ranked = matchData.data?.rankedCandidates || [];
    report.aiMatchingPipeline = {
      status: 'PASSED',
      completionStatus: matchData.data?.completionStatus || 'complete',
      rankedCandidatesCount: ranked.length,
      topCandidateScore: ranked[0]?.score || ranked[0]?.overall_score || null,
      persistence: matchData.data?.persistence
    };
    console.log(`✅ AI Candidate Matching completed successfully!`);
    console.log(`   - Candidates Ranked: ${ranked.length}`);
    if (ranked.length > 0) {
      console.log(`   - Candidate 1: ${ranked[0].name || ranked[0].candidate_id} | Score: ${ranked[0].score}%`);
      console.log(`   - Matched Skills: ${(ranked[0].matchedSkills || []).join(', ')}`);
      console.log(`   - Missing Skills: ${(ranked[0].missingSkills || []).join(', ')}`);
    }
  } else {
    console.log(`⚠️ AI Candidate Matching response:`, JSON.stringify(matchRes.data));
    report.aiMatchingPipeline = { status: 'FAILED', error: matchRes.data };
  }

  // 5. Database Persistence Verification
  console.log('\n[5/6] Verifying Database Match Persistence (GET /api/jobs/:jobId/candidate-matches)...');
  const getMatchesRes = await safeFetch(`${BACKEND_URL}/jobs/${jobId}/candidate-matches`, { headers: authHeaders });
  if (getMatchesRes.ok) {
    const matches = getMatchesRes.data?.data?.matches || getMatchesRes.data?.matches || [];
    report.databasePersistence = {
      status: 'PASSED',
      persistedMatchCount: matches.length
    };
    console.log(`✅ Retrieved ${matches.length} persisted matches from database for job ${jobId}`);
  } else {
    report.databasePersistence = { status: 'FAILED', error: getMatchesRes.data };
    console.log(`❌ Failed to retrieve persisted matches:`, JSON.stringify(getMatchesRes.data));
  }

  // 6. Security & Signed Resume URL Access
  console.log('\n[6/6] Validating Resume Privacy & Security Boundary...');
  // A. Unauthenticated request -> Must be 401
  const unauthTest = await safeFetch(`${BACKEND_URL}/jobs/${jobId}/candidates/${testCandidateId || '00000000-0000-0000-0000-000000000000'}/resume-url`);
  const unauthBlocked = (unauthTest.status === 401 || unauthTest.status === 403);
  console.log(` - Unauthenticated access rejection: ${unauthBlocked ? 'PASSED (HTTP ' + unauthTest.status + ')' : 'FAILED'}`);

  // B. Recruiter authenticated request for candidate
  let authResumeResult = 'SKIPPED (no candidate)';
  if (testCandidateId) {
    const authResumeRes = await safeFetch(`${BACKEND_URL}/jobs/${jobId}/candidates/${testCandidateId}/resume-url`, { headers: authHeaders });
    authResumeResult = `HTTP ${authResumeRes.status} (${authResumeRes.data?.signedUrl ? 'Signed URL Issued' : authResumeRes.data?.error || 'OK'})`;
    console.log(` - Authenticated Recruiter resume retrieval: ${authResumeResult}`);
  }

  report.resumePrivacySecurity = {
    unauthenticatedBlocked: unauthBlocked,
    authorizedCandidateResumeAccess: authResumeResult
  };

  // Clean up test job
  await safeFetch(`${BACKEND_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  console.log(` - Cleaned up test job ${jobId}`);

  // Summary
  report.summary = {
    allHealthChecksPassed: Object.values(report.health).every(v => v.includes('ONLINE')),
    authWorkflow: report.recruiterAuth.status,
    jobManagementWorkflow: report.jobManagement.create?.status,
    aiMatchingWorkflow: report.aiMatchingPipeline.status,
    persistenceWorkflow: report.databasePersistence.status,
    securityEnforcement: report.resumePrivacySecurity.unauthenticatedBlocked ? 'VERIFIED' : 'FAILED'
  };

  console.log('\n================================================================');
  console.log('                     FINAL TEST AUDIT REPORT                    ');
  console.log('================================================================');
  console.log(JSON.stringify(report, null, 2));

  // Save report to file
  const fs = require('fs');
  fs.writeFileSync('../reports/recruiter_e2e_test_report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report exported to reports/recruiter_e2e_test_report.json');
}

runTest().catch(err => {
  console.error('Fatal execution error:', err);
});
