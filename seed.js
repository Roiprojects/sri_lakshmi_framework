const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const seedGallery = [
    { category: 'passport', title: 'Our Passport Photo Work', description: 'Recent high-quality passport photography showcase', imagepath: 'assets/passport_visa_1.jpg', is_visible: true },
    { category: 'passport', title: 'Visa Photo Project', description: 'Showcasing international visa photo accuracy and quality', imagepath: 'assets/passport_visa_2.jpg', is_visible: true },
    { category: 'acrylic', title: 'Acrylic Frame Installation', description: 'Showcasing a finished acrylic frame installation in a modern home', imagepath: 'assets/customised_acrylic_frame.jpg', is_visible: true },
    { category: 'acrylic', title: 'Premium Photo Showcase', description: 'A collection of premium photo frames professionally mounted', imagepath: 'assets/featured_photo_frame.png', is_visible: true },
    { category: 'collage', title: 'Family Collage Portfolio', description: 'A beautiful multi-photo collage project completed for a regular client', imagepath: 'assets/collage_photo_frame_works.jpg', is_visible: true },
    { category: 'collage', title: 'Recent Collage Work', description: 'Recent custom layout work for a large wall collage', imagepath: 'assets/collage_frame.jpg', is_visible: true },
    { category: 'certificate', title: 'Bulk Order Project', description: 'Recent bulk certificate framing for a local university', imagepath: 'assets/certificate.jpg', is_visible: true },
    { category: 'corporate', title: 'Corporate Branding Work', description: 'Branded photo frames created for a corporate client event', imagepath: 'assets/cg_photo_frame.png', is_visible: true },
    { category: 'badges', title: 'Custom Badge Showcase', description: 'Event badges produced for a regional technology conference', imagepath: 'assets/badge.jpg', is_visible: true }
];

const seedFrames = [
    // Passport & Visa
    { title: 'Standard Passport Print', category: 'passport-frames', badgetext: 'Bestseller', description: 'Professional grade prints on high-quality glossy paper for all official identity documents.', imagepath: 'assets/passport_visa_1.jpg', is_visible: true },
    { title: 'International Visa Print', category: 'passport-frames', badgetext: 'Quick Delivery', description: 'Custom-sized prints explicitly formatted for specific country visa standards.', imagepath: 'assets/passport_visa_2.jpg', is_visible: true },
    
    // Bulk Certificate
    { title: 'A4 Certificate Border Frame', category: 'bulk-certificate', badgetext: 'Popular', description: 'Sleek professional frames for A4 certificates, available in classic black or natural wood.', imagepath: 'assets/certificate.jpg', is_visible: true },
    { title: 'Gold-Edge Award Frame', category: 'bulk-certificate', badgetext: 'Bulk Options', description: 'Premium award frames with gold trim to add a touch of prestige to any commendation.', imagepath: 'assets/certificate4.jpg', is_visible: true },

    // Acrylic
    { title: 'Crystal Acrylic Desk Block', category: 'acrylic-frames', badgetext: 'Premium', description: 'A self-standing crystal clear acrylic block that gives your photo a modern 3D look.', imagepath: 'assets/customised_acrylic_frame.jpg', is_visible: true },
    { title: 'Wall-Mount Acrylic Display', category: 'acrylic-frames', badgetext: 'Modern', description: 'Sophisticated wall-mounted acrylic frame with metallic stand-off corners for a floating effect.', imagepath: 'assets/featured_photo_frame.png', is_visible: true },

    // Collage
    { title: 'Layout Multi-Photo Frame', category: 'collage-frames', badgetext: 'Best Value', description: 'Standard multi-photo frames for creating personal family stories on your wall.', imagepath: 'assets/collage_photo_frame_works.jpg', is_visible: true },

    // Badges
    { title: 'Pin-Back Event Badge', category: 'badges-frames', badgetext: 'Bulk', description: 'Durable custom badges with high-resolution printing and secure pin attachments.', imagepath: 'assets/badge.jpg', is_visible: true },

    // ID Cards
    { title: 'Durable PVC ID Card', category: 'id-cards', badgetext: 'Essential', description: 'Cracking-resistant PVC cards with vibrant, fade-resistant photography for professional use.', imagepath: 'assets/id%20cards.jpg', is_visible: true }
];

const seedCorporate = [
    { title: 'Customized Photo Frames', badgetext: 'Custom', description: 'Personalized wooden and acrylic frames tailored for bulk corporate orders.', imagepath: 'assets/cg_photo_frame.png', is_visible: true },
    { title: 'Corporate Mementos', badgetext: 'Premium', description: 'Elegant crystal, glass, and wooden mementos for partner appreciation.', imagepath: 'assets/cg_memento.png', is_visible: true },
    { title: 'Certificates Framing', badgetext: 'Bulk', description: 'High-quality frames designed for corporate training and achievement certificates.', imagepath: 'assets/cg_certificate.png', is_visible: true },
    { title: 'Professional Badges', badgetext: 'Essential', description: 'Custom printed employee badges and identification tags with company branding.', imagepath: 'assets/cg_badge.png', is_visible: true }
];

const seedTestimonials = [
    { clientname: 'Ramesh K.', rating: 5, quote: 'Excellent quality frames and great service. I ordered a custom decorative frame for my living room and the detail is absolutely stunning.', clientimage: 'assets/south_indian_man_ramesh.png', is_visible: true },
    { clientname: 'Deepa N.', rating: 5, quote: 'Perfect corporate gifting partner. We ordered 200 executive gift sets for our annual event, and the premium packaging wow\'d our partners.', clientimage: 'assets/south_indian_woman_deepa.png', is_visible: true },
    { clientname: 'Srinivasan M.', rating: 5, quote: 'The attention to detail in their customised acrylic frames is second to none. As an architect, I appreciate the precision and quality they bring.', clientimage: 'assets/south_indian_man_srinivasan.png', is_visible: true }
];

async function seedDatabase() {
    console.log('Clearing existing records...');
    await supabase.from('gallery').delete().not('id', 'is', null);
    await supabase.from('frames').delete().not('id', 'is', null);
    await supabase.from('corporate_gifts').delete().not('id', 'is', null);
    await supabase.from('testimonials').delete().not('id', 'is', null);

    console.log('Seeding Gallery...');
    const { error: gErr } = await supabase.from('gallery').insert(seedGallery);
    if(gErr) console.error(gErr);

    console.log('Seeding Frames...');
    const { error: fErr } = await supabase.from('frames').insert(seedFrames);
    if(fErr) console.error(fErr);

    console.log('Seeding Corporate Gifts...');
    const { error: cErr } = await supabase.from('corporate_gifts').insert(seedCorporate);
    if(cErr) console.error(cErr);

    console.log('Seeding Testimonials...');
    const { error: tErr } = await supabase.from('testimonials').insert(seedTestimonials);
    if(tErr) console.error(tErr);

    console.log('Seeding Default Settings...');
    await supabase.from('settings').delete().not('id', 'is', null);
    const { error: sErr } = await supabase.from('settings').insert([
        { id: 'phone', value: '+91 89714 88451' },
        { id: 'whatsapp', value: '918971488451' }
    ]);
    if(sErr) console.error(sErr);

    console.log('✅ Seeding Complete!');
}

seedDatabase();
