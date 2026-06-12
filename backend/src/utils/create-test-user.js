require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function run() {
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
    console.error('Error creating user:', error.message);
    process.exit(1);
  }
  console.log('User created successfully:', JSON.stringify(data.user, null, 2));
}

run();
