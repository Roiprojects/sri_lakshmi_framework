const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const seedGallery = [
    { title: 'Acrylic Frame', category: 'acrylic', badgeText: '', description: 'Premium acrylic framing.', imagePath: 'assets/featured_photo_frame.png' },
    { title: 'Corporate Plaque', category: 'corporate', badgeText: 'Popular', description: 'Elegant plaque for gifts.', imagePath: 'assets/certificate.jpg' }
];

async function run() {
    const { error } = await supabase.from('gallery').insert(seedGallery);
    if (error) console.error("INSERT ERROR: ", error);
    else console.log("INSERT SUCCESS");
}
run();
