const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
global.WebSocket = WebSocket;
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const options = {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
};

const supabase = createClient(supabaseUrl, supabaseKey, options);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, options);

module.exports = { supabase, supabaseAdmin };
