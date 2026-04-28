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
        // Map each section to its real Supabase table
        const tableMap = {
            'gallery':         'gallery',
            'frames':          'frames',
            'testimonials':    'testimonials',
            'corporate_gifts': 'corporate_gifts',
            'hero_banners':    'hero_banners',
            'home_gallery':    'site_content',
            'about':           'site_content',
            'categories':      'categories',
        };

        const table = tableMap[section] || section;

        // Query Supabase REST API directly
        try {
            const supaUrl = `${this.SUPABASE_URL}/rest/v1/${table}`;

            // site_content stores multiple sections — filter by section column
            // All other tables are single-purpose — no section filter needed
            let params = (table === 'site_content')
                ? `select=*&section=eq.${section}&order=created_at.desc`
                : `select=*&order=created_at.desc`;

            if (onlyVisible) params += '&is_visible=eq.true';

            // Special case: gallery and frames pages both show a combined view to ensure no duplicates and full visibility
            if (section === 'frames' || section === 'gallery') {
                const queryParams = `select=*&order=created_at.desc${onlyVisible ? '&is_visible=eq.true' : ''}`;
                
                // Fetch from both frames and gallery tables in parallel
                const [fRes, gRes] = await Promise.all([
                    fetch(`${this.SUPABASE_URL}/rest/v1/frames?${queryParams}`, {
                        headers: { 'apikey': this.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}` }
                    }),
                    fetch(`${this.SUPABASE_URL}/rest/v1/gallery?${queryParams}`, {
                        headers: { 'apikey': this.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}` }
                    })
                ]);
 
                let framesData = fRes.ok ? await fRes.json() : [];
                let galleryData = gRes.ok ? await gRes.json() : [];
 
                // These categories from the gallery should also appear in the frames catalog
                const frameRelevantCats = [
                    'passport', 'acrylic', 'collage', 'certificate', 'badges', 'id-cards', 'id cards',
                    'passport-frames', 'acrylic-frames', 'collage-frames', 'bulk-certificate', 'badges-frames', 'id-cards-and-tags', 'frames'
                ];

                let finalGallery = galleryData;
                if (section === 'frames') {
                    finalGallery = galleryData.filter(item => {
                        if (!item.category) return false;
                        const catNormalized = item.category.toLowerCase().replace(/[-\s]/g, '');
                        return frameRelevantCats.some(c => c.toLowerCase().replace(/[-\s]/g, '') === catNormalized);
                    });
                }
 
                // Merge datasets, sort by date, then deduplicate
                // Sorting FIRST ensures that when we deduplicate, we keep the version from the table we prefer OR the newest one.
                const allItems = [...framesData, ...finalGallery].sort((a, b) => {
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                });

                const seenPaths = new Set();
                const combined = [];
                
                allItems.forEach(item => {
                    const path = (item.imagepath || item.clientimage || '').toLowerCase().trim();
                    if (path && !seenPaths.has(path)) {
                        seenPaths.add(path);
                        combined.push(item);
                    }
                });
                
                if (combined.length > 0) {
                    console.log(`✅ Loaded ${combined.length} deduplicated "${section}" items (Frames: ${framesData.length}, Gallery: ${galleryData.length})`);
                    return combined;
                }
                return null;
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
                    console.log(`✅ Loaded ${data.length} "${section}" items from Supabase (table: ${table})`);
                    return data;
                }
            }
        } catch (e) {
            console.warn(`Supabase fetch failed for "${section}":`, e);
        }

        return null; // Caller should use static fallback
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
