require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../config/supabase');

async function fixPassword() {
  const userId = '20000000-0000-0000-0000-000000000002';
  console.log(`Resetting password for flowtest@gmail.com (ID: ${userId})...`);
  
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: 'Test1234!'
  });

  if (error) {
    console.error('❌ Failed to update password:', error.message);
  } else {
    console.log('✅ Password successfully updated/reset by Admin Auth API!');
    console.log(data);
  }
}

fixPassword();
