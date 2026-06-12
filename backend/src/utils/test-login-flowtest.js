const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function testLogin() {
  const url = 'http://localhost:5000/api';
  const email = 'flowtest@gmail.com';

  console.log('Testing login as flowtest@gmail.com...');
  try {
    const loginRes = await axios.post(`${url}/auth/login`, {
      email,
      password: 'Test1234!'
    });
    console.log('✅ Login succeeded!');
    console.log('STATUS:', loginRes.status);
    console.log('RESPONSE:', JSON.stringify(loginRes.data, null, 2));
  } catch (err) {
    console.error('❌ Login failed:', err.response ? err.response.data : err.message);
  }
}

testLogin();
