require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabase } = require('../config/supabase');

async function testSignup() {
  const email = `test_node_${Date.now()}@gmail.com`;
  console.log(`Testing signup with email: ${email}`);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Test1234!',
    options: {
      data: {
        full_name: 'Node Test User',
        role: 'job_seeker'
      }
    }
  });

  if (error) {
    console.error('❌ Sign up failed!');
    console.error(error);
  } else {
    console.log('✅ Sign up succeeded!');
    console.log(data);
  }
}

testSignup();
