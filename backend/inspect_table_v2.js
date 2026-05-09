const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function inspectTable() {
  const { data, error } = await supabase.from('lesson_plans').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Data or Columns:', data);
  }
}

inspectTable();
