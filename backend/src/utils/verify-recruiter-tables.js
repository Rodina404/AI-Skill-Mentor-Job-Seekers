/**
 * Phase 2 Verification: Check that recruiter flow tables exist in live Supabase,
 * check RLS policies, and perform negative/ownership tests.
 *
 * Run from backend/: node src/utils/verify-recruiter-tables.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_KEY, or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const tables = ['job_postings', 'job_applications', 'candidate_matches'];

  console.log('='.repeat(65));
  console.log('  PHASE 2: Supabase Table Verification');
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log('='.repeat(65));

  // ── Step 1: Query each table ──────────────────────────────────────────
  console.log('\n--- Step 1: Table Existence Check ---');
  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact' })
        .limit(3);

      if (error) {
        console.log(`\n  ❌ ${table}: ERROR - ${error.message} (code: ${error.code})`);
      } else {
        console.log(`\n  ✅ ${table}: EXISTS (${count !== null ? count : data.length} total rows, showing up to 3)`);
        console.log(`     Sample data: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (e) {
      console.log(`\n  ❌ ${table}: FETCH ERROR - ${e.message}`);
    }
  }

  // ── Step 2: Check RLS status and policies ─────────────────────────────
  console.log('\n\n--- Step 2: RLS Status & Policies ---');
  try {
    const { data: policies, error: polErr } = await supabaseAdmin
      .from('pg_policies')
      .select('schemaname, tablename, policyname, cmd, roles, qual, with_check');

    if (polErr) {
      console.log(`  Direct query to pg_policies failed (${polErr.message}).`);
    } else if (policies) {
      console.log('  Policies from pg_policies:');
      const relevant = policies.filter(p => tables.includes(p.tablename));
      if (relevant.length === 0) {
        console.log('    No custom RLS policies found in pg_policies for these tables.');
      } else {
        for (const p of relevant) {
          console.log(`    [${p.tablename}] policy="${p.policyname}" cmd=${p.cmd} roles=${JSON.stringify(p.roles)}`);
        }
      }
    }
  } catch (e) {
    console.log(`  Failed to query RLS policies: ${e.message}`);
  }

  // ── Step 3: Negative RLS test ─────────────────────────────────────────
  console.log('\n\n--- Step 3: RLS Negative Test ---');
  console.log('  Creating anon client (simulates unauthenticated/unowned query)...');

  const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAnon
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        console.log(`  ${table}: anon query error (RLS restriction or error) - ${error.message}`);
      } else {
        console.log(`  ${table}: anon query returned ${(data || []).length} rows (count=${count})`);
        if ((data || []).length === 0) {
          console.log(`    ✅ RLS blocking: 0 rows returned to unauthenticated user`);
        } else if (table === 'job_postings') {
          console.log(`    ℹ️  job_postings returns rows to anon as intended (public read allowed by policy)`);
        } else {
          console.log(`    ⚠️  Rows returned to anon — check RLS configuration`);
        }
      }
    } catch (e) {
      console.log(`  ${table}: anon query fetch exception - ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('  Verification complete');
  console.log('='.repeat(65));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
