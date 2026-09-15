const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    console.log('Logging in...');
    // Create random user to test
    const email = `test${Date.now()}@example.com`;
    await axios.post('http://127.0.0.1:5001/api/auth/register', {
      name: 'Test',
      email: email,
      password: 'password'
    });
    
    const loginRes = await axios.post('http://127.0.0.1:5001/api/auth/login', {
      email: email,
      password: 'password'
    });
    
    const token = loginRes.data.token;
    console.log('Got token:', token);

    console.log('Uploading file...');
    const form = new FormData();
    form.append('resume', fs.createReadStream('../dummy_resume.txt'));
    form.append('name', 'Test Resume');

    const uploadRes = await axios.post('http://127.0.0.1:5001/api/resumes/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload success, resume id:', uploadRes.data.id);

    console.log('Analyzing resume...');
    const analyzeRes = await axios.post('http://127.0.0.1:5001/api/ai/resume-analyze', {
      resumeId: uploadRes.data.id
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Analyze success:', analyzeRes.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testUpload();
