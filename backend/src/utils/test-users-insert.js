require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function testUsersInsert() {
  const testId = '11111111-1111-1111-1111-111111111111';
  console.log(`Testing direct insert into public.users with ID: ${testId}`);

  // Fetch a role first to use
  const { data: roles, error: rolesErr } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'job_seeker')
    .limit(1);

  if (rolesErr || !roles || roles.length === 0) {
    console.error('❌ Failed to fetch job_seeker role:', rolesErr);
    return;
  }
  const roleId = roles[0].id;
  console.log(`Found job_seeker role ID: ${roleId}`);

  // Delete existing dummy if present
  await supabaseAdmin.from('users').delete().eq('id', testId);

  // Try direct insert
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: testId,
      auth_id: testId,
      role_id: roleId,
      first_name: 'Direct',
      last_name: 'Test',
      email: 'direct_test@example.com'
    })
    .select();

  if (error) {
    console.error('❌ Direct insert into users failed!');
    console.error(error);
  } else {
    console.log('✅ Direct insert into users succeeded!');
    console.log(data);
  }
}

testUsersInsert();
