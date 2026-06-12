require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function createFlowtestUser() {
  console.log('🔄 Cleaning up and creating flowtest@gmail.com via Admin Auth API...');

  // 1. Clean up from public tables and auth tables
  try {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === 'flowtest@gmail.com');
    if (existing) {
      console.log('Deleting existing auth user:', existing.id);
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
    }
  } catch (e) {
    console.log('Clean up warning (auth):', e.message);
  }

  // Double check delete from public tables via direct SQL since cascades might trigger
  // Wait, we can do it directly. Let's delete via public users table
  try {
    await supabaseAdmin.from('users').delete().eq('email', 'flowtest@gmail.com');
  } catch (e) {
    console.log('Clean up warning (public):', e.message);
  }

  // 2. Create user via Admin API (bypasses rate limits and auto-confirms email)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'flowtest@gmail.com',
    password: 'Test1234!',
    email_confirm: true,
    user_metadata: {
      full_name: 'Flow Test',
      role: 'job_seeker'
    }
  });

  if (error) {
    console.error('❌ Failed to create flowtest user:', error.message);
  } else {
    console.log('✅ flowtest@gmail.com successfully created via Admin API!');
    console.log('User ID:', data.user.id);
  }
}

createFlowtestUser();
