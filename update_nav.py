import glob

html_files = glob.glob('*.html')

old_nav = """                <li class="dropdown">
                    <a href="frames.html" class="dropbtn">Frames <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-content">
                        <a href="frames.html#photo-frames">Photo Frames</a>
                        <a href="frames.html#wall-frames">Wall Frames</a>
                        <a href="frames.html#custom-frames">Custom Frames</a>
                        <a href="frames.html#decorative-frames">Decorative Frames</a>
                        <a href="frames.html#corporate-frames">Corporate Frames</a>
                    </div>
                </li>"""

old_nav_active = old_nav.replace('class="dropbtn"', 'class="active dropbtn"')

new_nav = """                <li class="dropdown">
                    <a href="frames.html" class="dropbtn">Frames <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown-content">
                        <li class="dropdown-submenu">
                            <a href="#" class="submenu-btn">Standard Frames <i class="fas fa-chevron-right"></i></a>
                            <ul class="dropdown-submenu-content">
                                <li><a href="frames.html#photo-frames">Photo Frames</a></li>
                                <li><a href="frames.html#wall-frames">Wall Frames</a></li>
                            </ul>
                        </li>
                        <li class="dropdown-submenu">
                            <a href="#" class="submenu-btn">Specialty Frames <i class="fas fa-chevron-right"></i></a>
                            <ul class="dropdown-submenu-content">
                                <li><a href="frames.html#custom-frames">Custom Frames</a></li>
                                <li><a href="frames.html#decorative-frames">Decorative Frames</a></li>
                                <li><a href="frames.html#corporate-frames">Corporate Frames</a></li>
                            </ul>
                        </li>
                    </ul>
                </li>"""

new_nav_active = new_nav.replace('class="dropbtn"', 'class="active dropbtn"')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if file == 'frames.html':
        content = content.replace(old_nav_active, new_nav_active)
    else:
        content = content.replace(old_nav, new_nav)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
