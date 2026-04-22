import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update Phone Numbers
    content = content.replace('+91 98765 43210', '+91 89714 88451')
    
    # Update Instagram Link
    content = content.replace('<a href="#"><i class="fab fa-instagram"></i></a>', '<a href="https://www.instagram.com/sri_lakshmi_photo_frame_works_?igsh=eXJlNjF0Z3pibWxz" target="_blank"><i class="fab fa-instagram"></i></a>')
    
    # Add WhatsApp Icon to Social Links
    content = content.replace('<a href="#"><i class="fab fa-twitter"></i></a>', '<a href="#" style="display:none;"><i class="fab fa-twitter"></i></a>\n                    <a href="https://wa.me/918971488451" target="_blank"><i class="fab fa-whatsapp"></i></a>')
    
    # Update Address
    content = content.replace('123 Business Avenue, Suite 400<br>New Delhi, India 110001', 'Sri Lakshmi photo frame works<br>Bengaluru, Karnataka')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
