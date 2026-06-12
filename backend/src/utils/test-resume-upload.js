const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function runUploadFlow() {
  console.log('🔄 Starting Resume Upload Flow Test...');

  // 1. Read token
  let token = '';
  try {
    const authResult = JSON.parse(fs.readFileSync('src/utils/test-auth-result.json', 'utf8'));
    token = authResult.token;
  } catch (e) {
    console.error('❌ Failed to read auth token. Run test-auth-flow.js first!');
    return;
  }

  // 2. Prepare Form Data
  const filePath = path.resolve(__dirname, '../../../AI-Microservices/m1_extraction_service/data/resumes/resume_01_data_science_ahmed_mostafa.pdf');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Sample PDF not found at path: ${filePath}`);
    return;
  }
  console.log(`Found sample PDF: ${filePath}`);

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  // 3. Upload File
  console.log('\n--- STEP 4: Uploading Resume ---');
  let resumeId = '';
  try {
    const uploadRes = await axios.post('http://localhost:5000/api/resumes/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('STATUS:', uploadRes.status);
    console.log('RESPONSE:', JSON.stringify(uploadRes.data, null, 2));
    resumeId = uploadRes.data.resume_id;
  } catch (err) {
    console.error('❌ Upload failed:', err.response ? err.response.data : err.message);
    return;
  }

  // 4. Wait for processing and check status
  console.log('\n--- Waiting 12 seconds for background processing ---');
  await new Promise(resolve => setTimeout(resolve, 12000));

  console.log('\n--- Checking Resume Status ---');
  try {
    const statusRes = await axios.get(`http://localhost:5000/api/resumes/${resumeId}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('STATUS:', statusRes.status);
    console.log('RESPONSE:', JSON.stringify(statusRes.data, null, 2));
  } catch (err) {
    console.error('❌ Status check failed:', err.response ? err.response.data : err.message);
  }
}

runUploadFlow();
