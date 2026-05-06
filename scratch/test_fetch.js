const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const ws = require('ws');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  realtime: { transport: ws }
});

async function testFetch() {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@mayeso.com',
      password: 'Password123!'
    });

    if (authError) throw authError;

    const token = authData.session.access_token;
    console.log('Logged in. Token length:', token.length);

    const client = axios.create({
      baseURL: 'http://localhost:5000/api/v1'
    });

    const response = await client.get('/sections', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', JSON.stringify(err.response?.data, null, 2));
    console.error('Error Message:', err.message);
  }
}

testFetch();
