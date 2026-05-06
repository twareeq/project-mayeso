const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@mayeso.com')
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Admin Profile:', data);
  }
}

checkAdmin();
