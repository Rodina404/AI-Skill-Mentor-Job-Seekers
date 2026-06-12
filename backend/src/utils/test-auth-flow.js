const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

async function runAuthFlow() {
  console.log('🔄 Starting login and /me verification flow for flowtest@gmail.com...');
  const url = 'http://localhost:5000/api';
  const email = 'flowtest@gmail.com';

  // 2. Login
  console.log('\n--- 2b. Login ---');
  let token = '';
  try {
    const loginRes = await axios.post(`${url}/auth/login`, {
      email,
      password: 'Test1234!'
    });
    console.log('STATUS:', loginRes.status);
    console.log('RESPONSE:', JSON.stringify(loginRes.data, null, 2));
    token = loginRes.data.access_token;
  } catch (err) {
    console.error('❌ Login failed:', err.response ? err.response.data : err.message);
    return;
  }

  // 3. Get current user
  console.log('\n--- 2c. Get Current User ---');
  try {
    const meRes = await axios.get(`${url}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('STATUS:', meRes.status);
    console.log('RESPONSE:', JSON.stringify(meRes.data, null, 2));
  } catch (err) {
    console.error('❌ Get /me failed:', err.response ? err.response.data : err.message);
  }

  // Write output values to a json file so we can read them in subsequent steps
  const fs = require('fs');
  fs.writeFileSync('src/utils/test-auth-result.json', JSON.stringify({ email, token, userId: 'c8dc7b41-8153-4926-ac76-9388a648cca4' }, null, 2));
  console.log('\nSaved auth test credentials to src/utils/test-auth-result.json');
}

runAuthFlow();
