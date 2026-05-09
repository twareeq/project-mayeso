const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function checkProfiles() {
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role, school_id');
  console.log('Profiles:', JSON.stringify(profiles, null, 2));
}

checkProfiles();
