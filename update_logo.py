import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace multi-line text logo (index.html style)
    content = re.sub(
        r'<a href="index\.html" class="logo">\s*Lakshmi\s*<span>Framework</span>\s*</a>',
        '<a href="index.html" class="logo"><img src="assets/logo.jpg" alt="Sri Lakshmi Logo" class="logo-img"></a>',
        content
    )

    # Replace already-converted single-line image logos that might have duplicated
    # (No-op if already correct)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done.")
