/**
 * Configuration for Sri Lakshmi Studio
 * Handles API routing: server → Supabase direct → static fallback
 */

const CONFIG = {
    PORT: 3000,

    // Supabase direct connection (used when server is offline)
    SUPABASE_URL: 'https://ytajatxcbryruoqxkldb.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWphdHhjYnJ5cnVvcXhrbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjAzNjcsImV4cCI6MjA5MDY5NjM2N30.mCJHKI8ixpzZRvWGo0bKUz8Q_b6GjTX_SEIKYtPnw7o',

    get API_BASE_URL() {
        if (window.location.protocol === 'file:') {
            return `http://localhost:${this.PORT}`;
        }
        return '';
    },

    getApiUrl(endpoint) {
        const base = this.API_BASE_URL;
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${formattedEndpoint}`;
    },

    /**
     * Smart fetch: tries local server first, falls back to direct Supabase query.
     * section: 'gallery' | 'frames' | 'home_gallery' | 'hero_banners' | etc.
     * onlyVisible: filter to is_visible=true records
     */
    async smartFetch(section, onlyVisible = true) {
        // 1. Try local/Vercel server first
        try {
            const endpointMap = {
                'gallery':          '/api/gallery',
                'frames':           '/api/frames',
                'home_gallery':     '/api/home-gallery',
                'hero_banners':     '/api/hero_banners',
                'testimonials':     '/api/testimonials',
                'corporate_gifts':  '/api/corporate_gifts',
                'categories':       '/api/categories',
                'about':            '/api/about',
            };
            const endpoint = endpointMap[section] || `/api/${section}`;
            const url = this.getApiUrl(endpoint) + (onlyVisible ? '?public=true' : '');
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 4000); // 4s timeout
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) return data;
            }
        } catch (e) {
            console.warn(`Server fetch failed for "${section}", trying Supabase directly...`);
        }

        // 2. Fallback: query Supabase REST API directly
        try {
            const supaUrl = `${this.SUPABASE_URL}/rest/v1/site_content`;
            let params = `select=*&section=eq.${section}&order=created_at.desc`;
            if (onlyVisible) params += '&is_visible=eq.true';

            // Special case: frames also includes gallery items with frame-compatible categories
            if (section === 'frames') {
                params = `select=*&or=(section.eq.frames,and(section.eq.gallery,category.in.(passport,acrylic,collage,certificate,badges)))&order=created_at.desc`;
                if (onlyVisible) params += '&is_visible=eq.true';
            }

            const res = await fetch(`${supaUrl}?${params}`, {
                headers: {
                    'apikey': this.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`✅ Loaded ${data.length} "${section}" items from Supabase directly`);
                    return data;
                }
            }
        } catch (e) {
            console.warn(`Supabase direct fetch also failed:`, e);
        }

        return null; // Both failed — caller should use static fallback
    },

    /**
     * Resolve image URL:
     * - Full https:// URLs (Supabase Storage) returned as-is
     * - Local assets/... paths returned relative (works without server)
     */
    getAssetUrl: function(path) {
        if (!path) return 'assets/placeholder.png';
        if (path.startsWith('http')) return path; // Supabase Storage URL

        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        if (cleanPath.startsWith('assets/')) {
            // Always use relative path for local asset files
            return window.location.protocol === 'file:' ? cleanPath : '/' + cleanPath;
        }

        if (window.location.protocol === 'file:') {
            return `${this.API_BASE_URL}/${cleanPath}`;
        }
        return '/' + cleanPath;
    },

    getPageUrl: function(pageName) {
        if (pageName === 'index') {
            return window.location.protocol === 'file:' ? 'index.html' : '/';
        }
        if (window.location.protocol !== 'file:') {
            return '/' + pageName.replace('.html', '');
        }
        return pageName.endsWith('.html') ? pageName : pageName + '.html';
    }
};

window.APP_CONFIG = CONFIG;
