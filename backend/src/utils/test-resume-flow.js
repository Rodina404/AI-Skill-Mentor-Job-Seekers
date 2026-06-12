const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000/api';

async function run() {
  try {
    console.log('--- 1. LOGIN ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'flowtest@gmail.com',
      password: 'Test1234!'
    });
    console.log('Login successful.');
    const token = loginRes.data.access_token;
    console.log('Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n--- 2. UPLOADING RESUME ---');
    const filePath = path.resolve(__dirname, '../../../AI-Microservices/m1_extraction_service/data/resumes/resume_01_data_science_ahmed_mostafa.pdf');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
      filename: 'resume_01_data_science_ahmed_mostafa.pdf',
      contentType: 'application/pdf'
    });

    const uploadRes = await axios.post(`${BASE_URL}/resumes/upload`, form, {
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    });

    console.log('Upload response:', JSON.stringify(uploadRes.data, null, 2));
    const resumeId = uploadRes.data.resume_id;

    console.log('\nWaiting 10 seconds for background processing...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('\n--- 3. CHECKING RESUME STATUS ---');
    const statusRes = await axios.get(`${BASE_URL}/resumes/${resumeId}/status`, { headers });
    console.log('Status response:', JSON.stringify(statusRes.data, null, 2));

    console.log('\n--- 4. LISTING ALL USER RESUMES ---');
    const listRes = await axios.get(`${BASE_URL}/resumes`, { headers });
    console.log('List response:', JSON.stringify(listRes.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

run();
