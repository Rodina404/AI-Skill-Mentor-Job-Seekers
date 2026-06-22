/**
 * AI Skill Mentor - Integration & Smoke Test Script
 * Tests Job Seeker Flow and Recruiter Flow sequentially
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenvPath = fs.existsSync('./backend/.env') ? './backend/.env' : './.env';
require('dotenv').config({ path: dotenvPath });

const API_BASE_URL = 'http://localhost:5000/api';

const dummyPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4gPj4gPj4gL0NvbnRlbnRzIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggMTY3ID4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzAgNzAwIFRkCihKb2huIERvZSkgVGoKMCAtMjAgVGQKKFNraWxsczogcHl0aG9uLCBqYXZhc2NyaXB0LCByZWFjdCwgYXdzLCBkb2NrZXIsIG5vZGUuanMsIGt1YmVybmV0ZXMpIFRqCjAgLTIwIFRkCihFZHVjYXRpb246IFN0YW5mb3JkIFVuaXZlcnNpdHkgQlNjKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI4MiAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDUgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjQ5OQolJUVPRgo=';


const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function ensureUserExists(email, password, role) {
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw listErr;

  const existing = listData.users.find(u => u.email === email);
  if (existing) {
    // Reset password to ensure correct login
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: {
        full_name: role === 'recruiter' ? 'Test Recruiter' : 'Test Seeker',
        role: role === 'recruiter' ? 'recruiter' : 'job_seeker'
      }
    });
    if (updateErr) throw updateErr;
    return;
  }

  // Create user directly via Admin SDK (bypasses rate limit and verification)
  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: role === 'recruiter' ? 'Test Recruiter' : 'Test Seeker',
      role: role === 'recruiter' ? 'recruiter' : 'job_seeker'
    }
  });

  if (createErr) throw createErr;
}

async function ensureJobPostingExists() {
  const { data: existing, error } = await supabaseAdmin
    .from('job_postings')
    .select('id')
    .eq('title', 'Software Engineer')
    .limit(1);
  
  if (error) throw error;
  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Insert a dummy job posting using admin SDK
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('job_postings')
    .insert({
      title: 'Software Engineer',
      job_description: 'We are looking for a Software Engineer with Python and AWS experience.',
      location: 'Remote',
      company: 'TechCorp Inc',
      required_skills: ['Python', 'AWS', 'JavaScript', 'React'],
      job_type: 'full_time',
      status: 'open'
    })
    .select()
    .single();

  if (insertErr) throw insertErr;
  return inserted.id;
}

async function loginUser(email, password) {
  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed: ${loginRes.status} - ${text}`);
  }

  const data = await loginRes.json();
  return data.access_token;
}

async function runTests() {
  console.log('═════════════════════════════════════════════════════════════');
  console.log('         AI SKILL MENTOR INTEGRATION SMOKE TEST              ');
  console.log('═════════════════════════════════════════════════════════════\n');

  const seekerEmail = 'test_seeker@example.com';
  const recruiterEmail = 'test_recruiter@example.com';
  const password = 'TestPass123';

  let seekerToken;
  let recruiterToken;
  let resumeId;
  let jobId;
  try {
    jobId = await ensureJobPostingExists();
    console.log(`✅ Default Job Posting configured with ID: ${jobId}\n`);
  } catch (err) {
    console.error(`❌ Failed to configure default Job Posting: ${err.message}`);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // JOB SEEKER FLOW
  // -------------------------------------------------------------
  console.log('┌───────────────────────────────────────────────────────────┐');
  console.log('│                    JOB SEEKER FLOW                        │');
  console.log('└───────────────────────────────────────────────────────────┘');

  // Step 1: Login/Signup
  try {
    await ensureUserExists(seekerEmail, password, 'job_seeker');
    seekerToken = await loginUser(seekerEmail, password);
    console.log(`✅ Step 1: Login / Signup seeker succeeded using: ${seekerEmail}`);
  } catch (err) {
    console.error('❌ Step 1: Login / Signup seeker failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 2: Upload Resume
  try {
    const pdfBuffer = Buffer.from(dummyPdfBase64, 'base64');
    const formData = new FormData();
    const fileObj = new File([pdfBuffer], 'sample.pdf', { type: 'application/pdf' });
    formData.append('file', fileObj);
    formData.append('jobTitle', 'Software Engineer');

    const res = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${seekerToken}`
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    resumeId = data.resume_id;
    console.log(`✅ Step 2: Resume Upload succeeded. Resume ID: ${resumeId}`);
  } catch (err) {
    console.error('❌ Step 2: Resume Upload failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 3: Poll status until "analyzed"
  try {
    let status = 'processing';
    let elapsed = 0;
    const maxTime = 60000;
    
    while (status !== 'analyzed' && status !== 'failed' && elapsed < maxTime) {
      console.log(`   Polling resume status... (${elapsed / 1000}s elapsed)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      elapsed += 3000;

      const res = await fetch(`${API_BASE_URL}/resumes/${resumeId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${seekerToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      status = data.status;
    }

    if (status !== 'analyzed') {
      throw new Error(`Polling timed out or status is failed: ${status}`);
    }

    console.log(`✅ Step 3: Resume status is analyzed`);
  } catch (err) {
    console.error('❌ Step 3: Resume Polling failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 3.5: Trigger Matching Pipeline
  try {
    const res = await fetch(`${API_BASE_URL}/matches/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    console.log(`✅ Step 3.5: Matching pipeline run succeeded`);
  } catch (err) {
    console.error('❌ Step 3.5: Matching pipeline run failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 4: POST /api/resumes/learning-path
  try {
    const res = await fetch(`${API_BASE_URL}/resumes/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ analysisId: resumeId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`✅ Step 4: Learning Path creation succeeded`);
  } catch (err) {
    console.error('❌ Step 4: Learning Path creation failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 5: GET /api/resumes/recommendations/:id
  try {
    const res = await fetch(`${API_BASE_URL}/resumes/recommendations/${resumeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${seekerToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`✅ Step 5: Recommendations fetch succeeded (found ${data.length} course recommendations)`);
  } catch (err) {
    console.error('❌ Step 5: Recommendations fetch failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 6: GET /api/roadmap/:resumeId
  try {
    const res = await fetch(`${API_BASE_URL}/roadmap/${resumeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${seekerToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`✅ Step 6: Roadmap fetch succeeded`);
  } catch (err) {
    console.error('❌ Step 6: Roadmap fetch failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 7: GET /api/courses
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${seekerToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`✅ Step 7: Courses list fetch succeeded (found ${data.length} courses)`);
  } catch (err) {
    console.error('❌ Step 7: Courses list fetch failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  console.log('\n┌───────────────────────────────────────────────────────────┐');
  console.log('│                    RECRUITER FLOW                         │');
  console.log('└───────────────────────────────────────────────────────────┘');

  // Step 1: Login/Signup Recruiter
  try {
    await ensureUserExists(recruiterEmail, password, 'recruiter');
    recruiterToken = await loginUser(recruiterEmail, password);
    console.log(`✅ Step 1: Login / Signup recruiter succeeded using: ${recruiterEmail}`);
  } catch (err) {
    console.error('❌ Step 1: Login / Signup recruiter failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Step 2: POST /api/jobs (create job posting)
  try {
    const sampleJob = {
      title: 'Software Engineer',
      job_description: 'We are looking for a Software Engineer with Python and AWS experience.',
      location: 'Remote',
      company: 'TechCorp Inc',
      required_skills: ['Python', 'AWS', 'JavaScript', 'React'],
      employment_type: 'full_time'
    };

    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify(sampleJob)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const responseData = await res.json();
    jobId = responseData.data.job.id;
    console.log(`✅ Step 2: Job posting created successfully. Job ID: ${jobId}`);
  } catch (err) {
    console.error('❌ Step 2: Job posting creation failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  // Wait 12 seconds for background CV matching to run for all candidates
  console.log('   Waiting 12 seconds for background matching pipeline...');
  await new Promise(resolve => setTimeout(resolve, 12000));

  // Step 3: GET /api/jobs/:jobId/applicants
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/applicants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${recruiterToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log(`✅ Step 3: Job applicants fetch succeeded (found ${data.data.candidates.length} candidates)`);
    if (data.data.candidates.length > 0) {
      console.log('      Ranked Applicants:');
      data.data.candidates.forEach((cand, idx) => {
        console.log(`      ${idx + 1}. ${cand.name} - Match Score: ${cand.score}%`);
      });
    }
  } catch (err) {
    console.error('❌ Step 3: Job applicants fetch failed');
    console.error(`   Error details: ${err.message}`);
    process.exit(1);
  }

  console.log('\n═════════════════════════════════════════════════════════════');
  console.log('        ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!        ');
  console.log('═════════════════════════════════════════════════════════════');
}

runTests();
