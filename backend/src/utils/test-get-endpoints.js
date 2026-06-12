const axios = require('axios');

async function testEndpoints() {
  console.log('Logging in as flowtest@gmail.com...');
  const login = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'flowtest@gmail.com',
    password: 'Test1234!'
  });
  const token = login.data.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  const endpoints = [
    { name: 'GET /api/resumes', url: 'http://localhost:5000/api/resumes' },
    { name: 'GET /api/matches', url: 'http://localhost:5000/api/matches' },
    { name: 'GET /api/roadmap/:resumeId', url: 'http://localhost:5000/api/roadmap/13c80c30-a853-429f-96e9-7053e052ec64' },
    { name: 'GET /api/notifications', url: 'http://localhost:5000/api/notifications' },
    { name: 'GET /api/progress', url: 'http://localhost:5000/api/progress' },
    { name: 'GET /api/skills/me', url: 'http://localhost:5000/api/skills/me' }
  ];

  for (const ep of endpoints) {
    console.log(`\n----------------------------------------\nTesting: ${ep.name}`);
    try {
      const response = await axios.get(ep.url, { headers });
      console.log(`Status: ${response.status}`);
      console.log('Response Body:', JSON.stringify(response.data, null, 2).substring(0, 1000) + (JSON.stringify(response.data).length > 1000 ? '\n... (truncated)' : ''));
    } catch (err) {
      console.error(`FAILED: ${ep.name}`);
      console.error(`Status: ${err.response?.status || 'No Status'}`);
      console.error('Error Body:', err.response?.data || err.message);
    }
  }
}

testEndpoints().catch(err => {
  console.error('Verification script crashed:', err.message);
});
