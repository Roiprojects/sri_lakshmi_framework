import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    old_footer = '<p>&copy; 2026 Lakshmi Framework. All rights reserved.</p>'
    new_footer = '<p>&copy; 2026 Lakshmi Framework. All rights reserved.</p>\n            <p style="margin-top: 8px; font-size: 0.95rem; font-weight: 500;"><a href="https://wa.me/919945379333" target="_blank" style="color: var(--secondary-color); text-decoration: none; transition: 0.3s;">Developed by ROI Infotech</a></p>'
    
    if new_footer not in content:
        content = content.replace(old_footer, new_footer)

    nav_contact_old = '<li><a href="contact.html">Contact Us</a></li>'
    nav_contact_new = '<li><a href="contact.html" class="btn btn-primary" style="padding: 10px 24px; color: #1a1a1a !important; font-weight: 600; border: none; line-height: 1;">Contact Us</a></li>'
    
    nav_contact_active_old = '<li><a href="contact.html" class="active">Contact Us</a></li>'
    nav_contact_active_new = '<li><a href="contact.html" class="btn btn-primary active" style="padding: 10px 24px; color: #1a1a1a !important; font-weight: 600; border: none; line-height: 1;">Contact Us</a></li>'

    if nav_contact_old in content:
        content = content.replace(nav_contact_old, nav_contact_new)
    if nav_contact_active_old in content:
        content = content.replace(nav_contact_active_old, nav_contact_active_new)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated successfully.')
