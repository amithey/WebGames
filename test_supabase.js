require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Fail: SUPABASE_URL or SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('Fail: ' + error.message);
    } else {
      console.log('Success: Connection to Supabase established');
    }
  } catch (err) {
    console.log('Fail: ' + err.message);
  }
}

testConnection();