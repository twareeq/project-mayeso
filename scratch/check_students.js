require('dotenv').config({ path: '/Users/star/Documents/Dev/GENIUS/project-mayeso/backend/.env' });
const { supabaseAdmin } = require('/Users/star/Documents/Dev/GENIUS/project-mayeso/backend/src/config/supabase');

async function checkStudents() {
  const { data, count, error } = await supabaseAdmin.from('students').select('*', { count: 'exact' });
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Total students in DB:', count);
  console.log('Students:', JSON.stringify(data, null, 2));
}

checkStudents();
