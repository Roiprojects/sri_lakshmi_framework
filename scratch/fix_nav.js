const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

const replacements = [
    { from: /href="\/frames/g, to: 'href="frames.html' },
    { from: /href="\/gallery/g, to: 'href="gallery.html' },
    { from: /href="\/contact/g, to: 'href="contact.html' },
    { from: /href="\/testimonials/g, to: 'href="testimonials.html' },
    { from: /href="\/about/g, to: 'href="about.html' },
    { from: /href="\/policy/g, to: 'href="policy.html' },
    { from: /href="\/admin/g, to: 'href="admin.html' },
    { from: /href="\/login/g, to: 'href="login.html' }
];

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Run standard link replacements
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    // 2. Add Staff Login link to footer if not already present
    if (!content.includes('Staff Login') && content.includes('Developed by ROI')) {
        content = content.replace(
            /Developed by ROI Infotech<\/a>/g,
            'Developed by ROI Infotech</a> | <a href="login.html" class="staff-login-link" style="color: rgba(255,255,255,0.4); text-decoration: none; margin-left: 10px; font-size: 0.8rem; transition: 0.3s;">Staff Login</a>'
        );
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
