const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function inspectTable() {
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'lesson_plans' });
  // If RPC doesn't exist, we'll try something else
  if (error) {
    console.log('RPC failed, trying raw query...');
    const { data: cols, error: colError } = await supabase.from('lesson_plans').select('*').limit(0);
    if (colError) console.error('Error:', colError);
    else console.log('Columns:', Object.keys(cols[0] || {}));
  } else {
    console.log('Table Info:', data);
  }
}

inspectTable();
