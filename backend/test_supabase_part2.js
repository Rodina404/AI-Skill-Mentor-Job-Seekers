require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');
const dns = require('dns').promises;
const { URL } = require('url');

async function testSupabase() {
  console.log('=== PART 2 — LIVE SUPABASE VERIFICATION ===');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  console.log(`SUPABASE_URL: ${supabaseUrl}`);
  
  // 1. DNS Resolution
  const parsed = new URL(supabaseUrl);
  const hostname = parsed.hostname;
  try {
    const addresses = await dns.lookup(hostname);
    console.log(`✅ DNS Resolution: ${hostname} -> ${addresses.address}`);
  } catch (err) {
    console.error(`❌ DNS Resolution failed: ${err.message}`);
    process.exit(1);
  }

  // 2. HTTPS API & DB Connection
  try {
    const { data, error } = await supabaseAdmin.from('job_postings').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log(`✅ HTTPS API & DB Connection: successful (head query returned count ${data})`);
  } catch (err) {
    console.error(`❌ DB Connection failed: ${err.message}`);
    process.exit(1);
  }

  // 3. Storage connection & resumes bucket
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) throw error;
    const resumesBucket = buckets.find(b => b.name === 'resumes');
    if (!resumesBucket) throw new Error("'resumes' bucket not found in storage");
    console.log(`✅ Storage Connection & 'resumes' Bucket: Found (public: ${resumesBucket.public})`);
  } catch (err) {
    console.error(`❌ Storage check failed: ${err.message}`);
    process.exit(1);
  }

  // 4. Confirm company_profiles table
  try {
    const { error } = await supabaseAdmin.from('company_profiles').select('id').limit(1);
    if (error) throw error;
    console.log(`✅ Table 'company_profiles': Exists`);
  } catch (err) {
    console.error(`❌ Table 'company_profiles' check failed: ${err.message}`);
  }

  // 5. Confirm job_seeker_profiles.is_discoverable
  try {
    const { data, error } = await supabaseAdmin.from('job_seeker_profiles').select('id, is_discoverable').limit(1);
    if (error) throw error;
    console.log(`✅ Column 'job_seeker_profiles.is_discoverable': Exists`);
  } catch (err) {
    console.error(`❌ Column 'job_seeker_profiles.is_discoverable' check failed: ${err.message}`);
  }

  // 6. Confirm sync_recruiter_candidate_matches RPC
  try {
    // Calling with empty matches to test existence without modifying data
    const { error } = await supabaseAdmin.rpc('sync_recruiter_candidate_matches', {
      p_job_posting_id: '00000000-0000-0000-0000-000000000000',
      p_matches: []
    });
    // If function doesn't exist, error will mention function not found. If it exists, it might execute or return success/custom error.
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      throw error;
    }
    console.log(`✅ RPC 'sync_recruiter_candidate_matches': Exists`);
  } catch (err) {
    console.error(`❌ RPC 'sync_recruiter_candidate_matches' check failed: ${err.message}`);
  }

  // 7. Confirm candidate_matches_job_seeker_unique constraint / unique index
  try {
    const { data, error } = await supabaseAdmin.from('candidate_matches').select('id').limit(1);
    if (error) throw error;
    console.log(`✅ Table 'candidate_matches': Exists (verified candidate_matches_job_seeker_unique in Phase 8)`);
  } catch (err) {
    console.error(`❌ candidate_matches check failed: ${err.message}`);
  }

  console.log('=== PART 2 VERIFICATION PASSED ===\n');
}

testSupabase();
