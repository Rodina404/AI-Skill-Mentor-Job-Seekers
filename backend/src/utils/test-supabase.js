require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabase, supabaseAdmin } = require('../config/supabase');

async function runTest() {
  console.log('🧪 Starting Supabase Connection Verification Test...\n');
  console.log(`URL: ${process.env.SUPABASE_URL}`);
  console.log(`Anon Key Length: ${process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0}`);
  console.log(`Service Key Length: ${process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.length : 0}\n`);

  let publicSuccess = false;
  let adminSuccess = false;

  // 1. Test Public Client (Auth check / ping)
  try {
    console.log('🔄 Testing Public Client...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Public Client Auth Error:', error.message);
    } else {
      console.log('✅ Public Client Connection: OK');
      publicSuccess = true;
    }
  } catch (err) {
    console.error('❌ Public Client Critical Failure:', err.message);
  }

  console.log('');

  // 2. Test Admin Client (DB tables queries & schema checks)
  try {
    console.log('🔄 Testing Admin Client DB Access...');
    
    // Test resumes table
    const { data: resumes, error: resumesErr } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .limit(1);

    if (resumesErr) {
      console.warn('⚠️ resumes table check returned error/not found:', resumesErr.message);
    } else {
      console.log('✅ resumes table: OK (Found', resumes.length, 'records)');
    }

    // Test job_postings table
    const { data: jobs, error: jobsErr } = await supabaseAdmin
      .from('job_postings')
      .select('*')
      .limit(1);

    if (jobsErr) {
      console.warn('⚠️ job_postings table check returned error/not found:', jobsErr.message);
    } else {
      console.log('✅ job_postings table: OK (Found', jobs.length, 'records)');
    }

    // Test candidate_matches table
    const { data: matches, error: matchesErr } = await supabaseAdmin
      .from('candidate_matches')
      .select('*')
      .limit(1);

    if (matchesErr) {
      console.warn('⚠️ candidate_matches table check returned error/not found:', matchesErr.message);
    } else {
      console.log('✅ candidate_matches table: OK (Found', matches.length, 'records)');
    }

    adminSuccess = true;
  } catch (err) {
    console.error('❌ Admin Client Critical Failure:', err.message);
  }

  console.log('\n========================================');
  if (publicSuccess && adminSuccess) {
    console.log('🎉 SUPABASE CONNECTION VERIFICATION SUCCESSFUL!');
  } else {
    console.log('❌ SUPABASE CONNECTION VERIFICATION FAILED!');
  }
  console.log('========================================');
}

runTest();
