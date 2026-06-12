require('dotenv').config();
const axios = require('axios');

async function main() {
  // Login
  const login = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'flowtest@gmail.com',
    password: 'Test1234!'
  });
  const token = login.data.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  // Get resumes
  const resumes = await axios.get('http://localhost:5000/api/resumes', { headers });
  const resumeId = resumes.data[0].id;
  console.log('Resume ID:', resumeId);

  const jobId = '009598ed-d700-4915-a93c-a9f7214b6740';

  // Run full matching pipeline
  console.log('Starting full matching pipeline...');
  const result = await axios.post('http://localhost:5000/api/matches/run', {
    resume_id: resumeId,
    job_id: jobId
  }, { headers, timeout: 120000 });

  console.log('FULL PIPELINE RESULT:');
  console.log(JSON.stringify(result.data, null, 2));

  // Get roadmap
  console.log('\nFetching saved roadmap...');
  const roadmap = await axios.get(`http://localhost:5000/api/roadmap/${resumeId}`, { headers });
  console.log('ROADMAP:');
  console.log(JSON.stringify(roadmap.data, null, 2));

  // Get notifications
  console.log('\nFetching notifications...');
  const notifs = await axios.get('http://localhost:5000/api/notifications', { headers });
  console.log('NOTIFICATIONS:');
  console.log(JSON.stringify(notifs.data, null, 2));
}

main().catch(err => {
  console.error('ERROR:', err.response?.data || err.message);
});
