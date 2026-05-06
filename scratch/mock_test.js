require('dotenv').config({ path: '/Users/star/Documents/Dev/GENIUS/project-mayeso/backend/.env' });
const { listSections } = require('/Users/star/Documents/Dev/GENIUS/project-mayeso/backend/src/modules/sections/controller');
const { supabaseAdmin } = require('/Users/star/Documents/Dev/GENIUS/project-mayeso/backend/src/config/supabase');

async function mockTest() {
  const req = {
    user: {
      id: 'e310a2e0-f387-4904-a259-aeb3a2f1ef91',
      role: 'admin',
      school_id: null
    }
  };
  
  const res = {
    json: (data) => console.log('Response:', JSON.stringify(data, null, 2)),
    status: (code) => {
      console.log('Status:', code);
      return res;
    }
  };
  
  const next = (err) => console.error('Next Error:', err);
  
  await listSections(req, res, next);
}

mockTest();
