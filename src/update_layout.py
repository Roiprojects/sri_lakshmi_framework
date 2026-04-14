import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Logo
    content = content.replace('src="assets/logo.jpg"', 'src="assets/logo.png"')

    # 2. Update Floating Container
    # We want to replace the existing floating container with the new unified one
    # Note: it might not exist if we already replaced it or it has slightly different spacing
    
    old_container_pattern = re.compile(
        r'<!-- Floating Buttons -->\s*<div class="floating-container">\s*<a href="tel:8971488451" class="floating-btn call-float"( title="Call Now")?>\s*<i class="fas fa-phone-alt"></i>\s*</a>\s*</div>',
        re.MULTILINE
    )
    
    new_container = """<!-- Floating Buttons -->
    <div class="floating-container">
        <button id="scroll-to-top" class="floating-btn" aria-label="Scroll to top" title="Scroll to Top"><i class="fas fa-arrow-up"></i></button>
        <a href="tel:8971488451" class="floating-btn call-float" title="Call Now"><i class="fas fa-phone-alt"></i></a>
        <a id="whatsapp-float" href="https://wa.me/918971488451" target="_blank" class="floating-btn whatsapp-float" aria-label="Contact us on WhatsApp" title="WhatsApp Us"><i class="fab fa-whatsapp"></i></a>
    </div>"""

    if old_container_pattern.search(content):
        content = old_container_pattern.sub(new_container, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Successfully updated HTML files.')
