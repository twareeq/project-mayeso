const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function checkAssignments() {
  const { data: assignments } = await supabase.from('teacher_assignments').select('*, classes(name), subjects(name)');
  console.log('Assignments:', JSON.stringify(assignments, null, 2));
}

checkAssignments();
