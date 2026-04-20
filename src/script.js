document.addEventListener('DOMContentLoaded', () => {
    // 1. Automatic Navigation Link Cleaning for Clean URLs
    if (window.location.protocol !== 'file:' && window.APP_CONFIG) {
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            const originalHref = link.getAttribute('href');
            // Don't modify external links or anchor links
            if (originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('#')) {
                link.href = window.APP_CONFIG.getPageUrl(originalHref.replace('.html', ''));
            }
        });
    }

    // ============================================
    // Animated Counter for Stats Bar
    // ============================================
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-count'));
                const duration = 1800;
                const step = target / (duration / 16);
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target.toLocaleString();
                        clearInterval(timer);
                    } else {
                        el.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.2 });
    counters.forEach(c => counterObserver.observe(c));

    // ============================================
    // Frame Tab highlight on scroll
    // ============================================
    const frameSections = document.querySelectorAll('.category-section');
    const frameTabs = document.querySelectorAll('.frame-tab');
    if (frameSections.length && frameTabs.length) {
        const tabObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    frameTabs.forEach(tab => {
                        tab.classList.toggle('active', tab.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { threshold: 0.4 });
        frameSections.forEach(s => tabObserver.observe(s));
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // Handle main dropdowns on mobile
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a.dropbtn');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Handle submenus on mobile
    const submenus = document.querySelectorAll('.dropdown-submenu');
    submenus.forEach(submenu => {
        const sublink = submenu.querySelector('a.submenu-btn');
        if (sublink) {
            sublink.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    submenu.classList.toggle('active');
                    const icon = sublink.querySelector('i');
                    icon.style.transform = submenu.classList.contains('active') ? 'rotate(90deg)' : 'none';
                }
            });
        }
    });

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        if (scrollToTopBtn) scrollToTopBtn.classList.toggle('visible', window.scrollY > 400);
    });

    // ============================================
    // Scroll-to-top Button
    // ============================================
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // WhatsApp Floating Button (Now in HTML)
    // ============================================

    // ============================================
    // Scroll Reveal — IntersectionObserver
    // ============================================
    
    // Add js-enabled class to body to activate reveal animations
    document.body.classList.add('js-enabled');

    const revealElements = document.querySelectorAll(
        '.product-card, .feature-item, .testimonial-card, .split-section, ' +
        '.category-section, .contact-form, .contact-info, .section-title, ' +
        '.section-subtitle, .intro-split-img, .intro-text, .story-text, .story-image, .mission-banner'
    );

    revealElements.forEach((el, i) => {
        // Assign reveal class based on element structure if not already present
        if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
            if (el.classList.contains('split-section') || el.classList.contains('intro-split-img') || el.classList.contains('story-text')) {
                const isEven = i % 2 === 0;
                el.classList.add(isEven ? 'reveal-left' : 'reveal-right');
            } else {
                el.classList.add('reveal');
            }
        }
    });

    // Stagger grids
    const staggerTargets = document.querySelectorAll(
        '.product-grid, .features-grid, .testimonial-grid, .services-grid, .strengths-grid'
    );
    staggerTargets.forEach(el => el.classList.add('stagger-children'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' 
    });

    // Expose observer globally
    window.revealObserver = observer;
    window.refreshReveal = () => {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children')
            .forEach(el => {
                if (!el.classList.contains('visible')) {
                    observer.observe(el);
                }
            });
    };

    window.refreshReveal();

    // Fail-safe: Force see all after 2.5 seconds in case observer fails
    setTimeout(() => {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            el.classList.add('visible');
        });
    }, 2500);

    // ============================================
    // Active nav link highlight by current page
    // ============================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ============================================
    // Dynamic Hero Slider
    // ============================================
    const initHeroSlider = () => {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.prev-arrow');
        const nextBtn = document.querySelector('.next-arrow');
        
        if (slides.length <= 0) return;

        let currentSlide = 0;
        let slideInterval;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            currentSlide = (index + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startSlideShow() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }

        function stopSlideShow() {
            clearInterval(slideInterval);
        }

        if (prevBtn && nextBtn) {
            nextBtn.onclick = () => { nextSlide(); startSlideShow(); };
            prevBtn.onclick = () => { prevSlide(); startSlideShow(); };
        }

        dots.forEach((dot, index) => {
            dot.onclick = () => { showSlide(index); startSlideShow(); };
        });

        showSlide(0);
        startSlideShow();
    };

    const fetchHeroBanners = async () => {
        const heroSection = document.querySelector('.hero-slider');
        if (!heroSection) return;

        try {
            const url = window.APP_CONFIG ? window.APP_CONFIG.getApiUrl('/api/hero_banners?public=true') : '/api/hero_banners?public=true';
            const res = await fetch(url);
            const banners = await res.json();

            // Defensive Check
            if (banners && Array.isArray(banners) && banners.length > 0) {
                // Remove existing slides except controls
                const existingSlides = heroSection.querySelectorAll('.slide');
                existingSlides.forEach(s => s.remove());

                const dotsContainer = heroSection.querySelector('.slider-controls');
                if (dotsContainer) dotsContainer.innerHTML = '';

                banners.forEach((banner, i) => {
                    const bannerImg = banner.imagepath || 'assets/placeholder.png';
                    const img = window.APP_CONFIG.getAssetUrl(bannerImg);
                    
                    // Add Slide
                    const slide = document.createElement('div');
                    slide.className = `slide ${i === 0 ? 'active' : ''}`;
                    slide.style.backgroundImage = `url('${img}')`;
                    slide.innerHTML = `
                        <div class="slide-overlay"></div>
                        <div class="slide-content">
                            <h1>${banner.title || 'Sri Lakshmi Studio'}</h1>
                            <p>${banner.subtitle || 'Premium Framing & Gifting'}</p>
                            <div class="hero-buttons">
                                <a href="contact.html" class="btn btn-primary">Contact Us</a>
                            </div>
                        </div>
                    `;
                    // Insert before arrows/dots
                    heroSection.insertBefore(slide, heroSection.querySelector('.prev-arrow'));

                    // Add Dot
                    if (dotsContainer) {
                        const dot = document.createElement('div');
                        dot.className = `dot ${i === 0 ? 'active' : ''}`;
                        dot.setAttribute('data-slide', i);
                        dotsContainer.appendChild(dot);
                    }
                });

                initHeroSlider();
            } else {
                console.log('No banners found or invalid format, using defaults.');
                initHeroSlider();
            }
        } catch (err) {
            console.error('Failed to load hero banners:', err);
            initHeroSlider(); // Fallback to whatever is there
        }
    };

    fetchHeroBanners();

    // ============================================
    // Gallery Filtering
    // ============================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => item.style.opacity = '1', 10);
                    } else {
                        item.style.opacity = '0';
                        setTimeout(() => item.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // ============================================
    // Lightbox Logic
    // ============================================
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lbPrev = document.querySelector('.lightbox-prev');
    const lbNext = document.querySelector('.lightbox-next');
    
    // Convert NodeList to Array and filter out currently hidden items
    let visibleItems = [];
    let currentLightboxIndex = 0;

    if (lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update visible items based on current active filter
                visibleItems = Array.from(galleryItems).filter(el => el.style.display !== 'none');
                currentLightboxIndex = visibleItems.indexOf(item);
                
                updateLightboxImage();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent scrolling
            });
        });

        const updateLightboxImage = () => {
            if (visibleItems.length === 0) return;
            const item = visibleItems[currentLightboxIndex];
            const imgSrc = item.querySelector('img').src;
            const captionText = item.querySelector('h4').textContent;
            
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = captionText;
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto'; // allow scrolling
            });
        }

        if (lbNext) {
            lbNext.addEventListener('click', (e) => {
                e.stopPropagation();
                currentLightboxIndex = (currentLightboxIndex + 1) % visibleItems.length;
                updateLightboxImage();
            });
        }

        if (lbPrev) {
            lbPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                currentLightboxIndex = (currentLightboxIndex - 1 + visibleItems.length) % visibleItems.length;
                updateLightboxImage();
            });
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // ============================================
    // Global Map Toggle
    // ============================================
    const mapToggleBtn = document.getElementById('map-toggle-btn');
    const mapContainer = document.getElementById('global-map-container');
    
    if (mapToggleBtn && mapContainer) {
        mapToggleBtn.addEventListener('click', () => {
            mapToggleBtn.classList.toggle('active');
            mapContainer.classList.toggle('expanded');
            
            // Optional: scroll slightly to show map if opening
            if(mapContainer.classList.contains('expanded')) {
                setTimeout(() => {
                    const y = mapContainer.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({top: y, behavior: 'smooth'});
                }, 300);
            }
        });
    }

    // ============================================
    // Global Site Settings (Phone / WhatsApp)
    // ============================================
    const fetchSiteSettings = async () => {
        try {
            const url = window.APP_CONFIG ? window.APP_CONFIG.getApiUrl('/api/settings') : '/api/settings';
            const res = await fetch(url);
            const settings = await res.json();
            
            if (settings && typeof settings === 'object') {
                if (settings.phone) {
                    // Update text displays
                    document.querySelectorAll('.dynamic-phone-text').forEach(el => el.textContent = settings.phone);
                    // Update tel links
                    const cleanPhone = settings.phone.replace(/\D/g, '');
                    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
                        if (!el.href.includes('wa.me')) el.href = `tel:${cleanPhone}`;
                    });
                }
                
                if (settings.whatsapp) {
                    const cleanWA = settings.whatsapp.replace(/\D/g, '');
                    // Update all WhatsApp links
                    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
                        el.href = `https://wa.me/${cleanWA}`;
                    });
                }

                if (settings.email) {
                    document.querySelectorAll('.dynamic-email-text').forEach(el => el.textContent = settings.email);
                    document.querySelectorAll('a[href^="mailto:"]').forEach(el => el.href = `mailto:${settings.email}`);
                }
            }
        } catch (err) {
            console.error('Failed to load site settings:', err);
        }
    };
    
    fetchSiteSettings();
});

// ============================================
// Global WhatsApp Enquiry Form Handler
// ============================================
function initWhatsAppRedirection() {
    // Helper to show/create popup
    const showPopup = () => {
        let popup = document.getElementById('whatsappPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'whatsappPopup';
            popup.className = 'popup-overlay';
            popup.innerHTML = `
                <div class="popup-container">
                    <i class="fas fa-check-circle" style="color: #c9a050; font-size: 3.5rem; margin-bottom: 20px;"></i>
                    <h3>Enquiry submitted successfully</h3>
                    <p>Thank you for reaching out. We are now redirecting you to WhatsApp to finalize your enquiry.</p>
                    <div class="popup-loader"></div>
                </div>
            `;
            document.body.appendChild(popup);
        }
        popup.style.display = 'flex';
        return popup;
    };

    // Handler function
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        
        // 1. Collect Data
        const name = form.querySelector('[name="name"]')?.value || 'Not provided';
        const email = form.querySelector('[name="email"]')?.value || 'Not provided';
        const phone = form.querySelector('[name="phone"]')?.value || 'Not provided';
        const message = form.querySelector('[name="message"]')?.value || 'Not provided';

        // 2. Format Message
        const waMessage = `*New Website Enquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Message:* ${message}`;
        const encodedMessage = encodeURIComponent(waMessage);
        
        // Target number: +91 89714 88451
        const waNumber = "918971488451";
        const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

        // 3. Show Success Popup
        const popup = showPopup();

        // 4. Redirect after short delay
        setTimeout(() => {
            window.open(waUrl, '_blank');
            popup.style.display = 'none';
            form.reset();
        }, 2500); // 2.5s for readability
    };

    // Attach to any form with the 'whatsapp-form' class or specific IDs
    const forms = document.querySelectorAll('.whatsapp-form, #contactForm, #enquiryForm');
    forms.forEach(form => {
        form.addEventListener('submit', handleSubmit);
    });
}

// Re-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppRedirection);
} else {
    initWhatsAppRedirection();
}
