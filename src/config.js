/**
 * Configuration for Sri Lakshmi Studio
 * This file handles logic to ensure the frontend can communicate with the backend
 * regardless of whether it's running via a server or as local files.
 */

const CONFIG = {
    // Port should match the one in server.js
    PORT: 3000,
    
    /**
     * Get the base URL for API calls.
     * If running via file:// protocol, it defaults to http://localhost:PORT
     */
    get API_BASE_URL() {
        if (window.location.protocol === 'file:') {
            return `http://localhost:${this.PORT}`;
        }
        // If running via http (e.g. on Vercel or local server), use relative path
        return '';
    },
    
    /**
     * Helper to get full API URL
     */
    getApiUrl(endpoint) {
        const base = this.API_BASE_URL;
        // Ensure endpoint starts with /
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${formattedEndpoint}`;
    },
    
    /**
     * Helper to resolve asset URLs (images, etc)
     * Handles prepending API_BASE_URL when running in file:// mode
     */
    getAssetUrl: function(path) {
        if (!path) return 'assets/placeholder.png';
        if (path.startsWith('http')) return path;
        
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        
        // If file protocol, use the local server as the source for all assets
        if (window.location.protocol === 'file:') {
            return `${this.API_BASE_URL}/${cleanPath}`;
        }
        
        // Otherwise use relative path from root
        return '/' + cleanPath;
    },

    /**
     * Helper to resolve page URLs (navigation)
     * Returns clean URLs for server mode, .html URLs for file mode
     */
    getPageUrl: function(pageName) {
        // Handle home page
        if (pageName === 'index') {
            return window.location.protocol === 'file:' ? 'index.html' : '/';
        }
        
        // If file protocol, always include .html
        if (window.location.protocol === 'file:') {
            return pageName.endsWith('.html') ? pageName : pageName + '.html';
        }
        
        // Otherwise use clean URL
        const cleanName = pageName.replace('.html', '');
        return '/' + cleanName;
    }
};

// Export to window for global access in HTML files
window.APP_CONFIG = CONFIG;
