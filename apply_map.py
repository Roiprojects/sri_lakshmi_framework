import glob

html_files = glob.glob('C:/Users/smith/.gemini/antigravity/scratch/lakshmi-framework/*.html')

if not html_files:
    print("No HTML files found!")

map_html = """
    <!-- Global Map Section -->
    <section class="global-map-section">
        <button id="map-toggle-btn" class="map-toggle-btn">
            Find Us <i class="fas fa-chevron-down"></i>
        </button>
        <div id="global-map-container" class="global-map-container">
            <div class="map-wrapper">
                <iframe src="https://maps.google.com/maps?q=1/4%20Th%20Main,%20Nehru%20Nagar%20Near%20Sheshadripuram%20College,%20Sheshadripuram,%20Bangalore,%20India%20560020&t=&z=15&ie=UTF8&iwloc=&output=embed" allowfullscreen loading="lazy"></iframe>
                <div class="map-actions">
                    <a href="https://maps.google.com/?q=1/4+Th+Main,+Nehru+Nagar+Near+Sheshadripuram+College,+Sheshadripuram,+Bangalore,+India+560020" target="_blank" class="btn btn-primary" style="display:inline-flex; align-items:center; justify-content:center; color:#1a1a1a!important;"><i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i>View in Google Maps</a>
                </div>
            </div>
        </div>
    </section>
"""

new_address = "1/4 Th Main, Nehru Nagar Near Sheshadripuram College,<br>Sheshadripuram, Bangalore, India 560020"

files_updated = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    content = content.replace("Sri Lakshmi photo frame works<br>Bengaluru, Karnataka", new_address)
    content = content.replace("Sri Lakshmi Photo Frame Works<br>Bengaluru, Karnataka", new_address)

    if 'global-map-section' not in content:
        content = content.replace('<!-- Footer Section -->', map_html + '\n    <!-- Footer Section -->')
        
    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        files_updated += 1
        print(f"Updated {file}")

print(f"Total files updated: {files_updated}")
