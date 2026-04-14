const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function main() {
  const { data, error } = await supabase.from('settings').upsert({ id: 'admin_password', value: 'LakshmiAdmin2026' });
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}
main();
