const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertPassports() {
  const items = [
    { section: 'gallery', category: 'passport', title: 'Passport Photo Service', imagepath: 'assets/passport_visa_1.jpg', is_visible: true },
    { section: 'gallery', category: 'passport', title: 'Visa Specifications', imagepath: 'assets/passport_visa_2.jpg', is_visible: true },
    { section: 'gallery', category: 'passport', title: 'Global Visa Photos', imagepath: 'assets/passport_visa_3.jpg', is_visible: true },
    { section: 'gallery', category: 'passport', title: 'Professional Passports', imagepath: 'assets/passport_visa_4.jpg', is_visible: true },
    { section: 'gallery', category: 'passport', title: 'Multiple Copy Options', imagepath: 'assets/passport_visa_5.jpg', is_visible: true }
  ];

  console.log("Inserting passport items...");
  const { data, error } = await supabase.from('site_content').insert(items);
  
  if (error) {
    console.error("Error inserting items:", error);
  } else {
    console.log("Successfully inserted", items.length, "items.");
  }
}

insertPassports();
