const axios = require('axios');

async function testBackend() {
  try {
    console.log('Logging in as flowtest@gmail.com...');
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'flowtest@gmail.com',
      password: 'Test1234!'
    });
    const token = login.data.access_token;
    console.log('Token successfully obtained.');
    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n--- Testing GET /api/jobs/recommended (Valid credentials) ---');
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/recommended', { headers });
      console.log(`Status: ${response.status}`);
      console.log('Response Body:', JSON.stringify(response.data, null, 2).substring(0, 1500) + (JSON.stringify(response.data).length > 1500 ? '\n... (truncated)' : ''));
    } catch (err) {
      console.error('FAILED GET /api/jobs/recommended');
      console.error(`Status: ${err.response?.status || 'No Status'}`);
      console.error('Error Body:', err.response?.data || err.message);
    }
  } catch (err) {
    console.error('Login failed:', err.message);
  }
}

testBackend();
