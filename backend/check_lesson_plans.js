const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

async function checkLessonPlans() {
  const { data, error } = await supabase
    .from('lesson_plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching lesson plans:', error);
    return;
  }

  console.log('Recent Lesson Plans:');
  console.log(JSON.stringify(data, null, 2));
}

checkLessonPlans();
