const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const seedFrames = [
    { title: 'Elegant Wood Finish', category: 'premium-wood', badgeText: 'Bestseller', description: 'Classic wood finish frames suitable for any decor.', imagePath: 'assets/featured_photo_frame.png' },
    { title: 'Sleek Metal Frame', category: 'metal-frames', badgeText: 'New', description: 'Modern metal frames for a minimalist look.', imagePath: 'assets/certificate.jpg' }
];

async function fixFrames() {
    console.log('Inserting frames data...');
    const { error } = await supabase.from('frames').insert(seedFrames);
    if(error) console.error('Error inserting frames:', error);
    else console.log('Successfully added frames.');
}
fixFrames();
