const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function checkData() {
  const { data: classes } = await supabase.from('classes').select('id, name');
  const { data: subjects } = await supabase.from('subjects').select('id, name, class_id');
  
  console.log('Classes:', JSON.stringify(classes, null, 2));
  console.log('Subjects:', JSON.stringify(subjects, null, 2));
}

checkData();
