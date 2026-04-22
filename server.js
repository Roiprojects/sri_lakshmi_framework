const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Supabase Connection (Configured via Environment Variables)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ytajatxcbryruoqxkldb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWphdHhjYnJ5cnVvcXhrbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjAzNjcsImV4cCI6MjA5MDY5NjM2N30.mCJHKI8ixpzZRvWGo0bKUz8Q_b6GjTX_SEIKYtPnw7o';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Connected to Supabase');
} else {
  console.warn('⚠️ Supabase URL or Key is missing.');
}

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === 'null') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Move static files to the TOP to resolve 404/MIME type issues on Vercel
// Assets are now consolidated in the root for reliable deployment
const publicPath = process.cwd();
app.use(express.static(publicPath, { extensions: ['html'] }));

// Setup Multer for Memory Storage (Cloud Uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let CURRENT_PASSWORD = process.env.ADMIN_PASSWORD || 'LakshmiAdmin2026';
let AUTH_TOKEN = 'token_' + Buffer.from(CURRENT_PASSWORD).toString('base64');

// Load password from Supabase settings once connected
if (supabaseUrl && supabaseKey) {
  // Use a catch to prevent crash if Supabase is unreachable at startup
  supabase.from('settings').select('value').eq('id', 'admin_password').single()
    .then(({ data, error }) => {
      if (!error && data && data.value) {
        CURRENT_PASSWORD = data.value;
        AUTH_TOKEN = 'token_' + Buffer.from(CURRENT_PASSWORD).toString('base64');
        console.log('✅ Admin password syncing from Supabase complete');
      }
    })
    .catch(err => {
      console.warn('⚠️ Could not sync admin password from Supabase:', err.message);
    });
}

app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  // Double-check against DB to ensure latest password if possible
  const { data } = await supabase.from('settings').select('value').eq('id', 'admin_password').single();
  if (data && data.value) {
    CURRENT_PASSWORD = data.value;
    AUTH_TOKEN = 'token_' + Buffer.from(CURRENT_PASSWORD).toString('base64');
  }

  if (password === CURRENT_PASSWORD) {
    res.json({ success: true, token: AUTH_TOKEN });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Password' });
  }
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${AUTH_TOKEN}`) return next();
  res.status(403).json({ error: 'Unauthorized access.' });
}

// ==== Generic CRUD Helper ====
async function handleGet(req, res, table) {
  let query = supabase.from(table).select('*');
  if (req.query.public === 'true') {
     query = query.eq('is_visible', true);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function handleGetSettings(req, res) {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const settings = {};
  data.forEach(s => settings[s.id] = s.value);
  res.json(settings);
}

async function handlePutSetting(req, res) {
  const { id, value } = req.body;
  if (!id || !value) return res.status(400).json({ error: 'Missing id or value' });
  const { data, error } = await supabase.from('settings').update({ value }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
}

const tableSchemas = {
  gallery: ['title', 'category', 'description', 'imagepath', 'is_visible', 'section'],
  frames: ['title', 'category', 'badgetext', 'description', 'imagepath', 'is_visible', 'section'],
  corporate_gifts: ['title', 'badgetext', 'description', 'imagepath', 'is_visible', 'section'],
  testimonials: ['clientname', 'rating', 'quote', 'clientimage', 'is_visible', 'section'],
  categories: ['name', 'type'],
  hero_banners: ['title', 'subtitle', 'imagepath', 'is_visible', 'section'],
  home_gallery: ['title', 'category', 'description', 'imagepath', 'is_visible', 'section'],
  about: ['title', 'description', 'imagepath', 'is_visible', 'section'],
  site_content: ['section', 'title', 'subtitle', 'description', 'category', 'badgetext', 'imagepath', 'is_visible', 'sort_order', 'clientname', 'rating', 'quote', 'clientimage']
};

function filterBody(body, table) {
  const allowed = tableSchemas[table] || [];
  const filtered = {};
  allowed.forEach(col => {
    if (Object.prototype.hasOwnProperty.call(body, col)) {
      let val = body[col];
      // Type conversions
      if (col === 'rating') val = parseInt(val) || 0;
      if (col === 'is_visible') val = val === 'true' || val === true;
      filtered[col] = val;
    }
  });
  return filtered;
}

// ==== Helper to upload to Supabase Storage ====
async function uploadToSupabase(file, bucket = 'uploads') {
  if (!file) return null;
  const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

async function handlePost(req, res, table) {
  try {
    const body = { ...req.body };
    const imgField = table === 'testimonials' ? 'clientimage' : 'imagepath';
    
    if (req.file) {
      body[imgField] = await uploadToSupabase(req.file);
    }
    
    const filtered = filterBody(body, table);
    const { data, error } = await supabase.from(table).insert([filtered]).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(`❌ Error in POST /api/${table}:`, err);
    res.status(500).json({ error: err.message });
  }
}

async function handlePut(req, res, table) {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    const imgField = table === 'testimonials' ? 'clientimage' : 'imagepath';

    if (req.file) {
      body[imgField] = await uploadToSupabase(req.file);
    }

    const filtered = filterBody(body, table);
    const { data, error } = await supabase.from(table).update(filtered).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(`❌ Error in PUT /api/${table}/${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
}

async function handleDelete(req, res, table) {
  try {
    const { id } = req.params;
    const { error: delError } = await supabase.from(table).delete().eq('id', id);
    if (delError) throw delError;
    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Error in DELETE /api/${table}/${req.params.id}:`, err);
    res.status(500).json({ error: err.message });
  }
}

// ==== API Routes ====
const tables = ['gallery', 'frames', 'testimonials', 'corporate_gifts', 'categories', 'hero_banners', 'home_gallery', 'about', 'site_content'];

tables.forEach(table => {
  const routes = [`/api/${table}`];
  
  // Hyphenated aliases to match frontend fetch calls
  if (table === 'corporate_gifts') {
    routes.push('/api/corporate-gifting');
    routes.push('/api/corporate-gifts');
  }
  if (table === 'hero_banners') {
    routes.push('/api/hero-banners');
  }
  if (table === 'home_gallery') {
    routes.push('/api/home-gallery');
  }

  routes.forEach(route => {
    // Determine the actual DB table and optional section filter
    let dbTable = table;
    let sectionFilter = null;

    const mappedSections = ['gallery', 'frames', 'corporate_gifts', 'hero_banners', 'home_gallery', 'about', 'testimonials'];
    if (mappedSections.includes(table)) {
      dbTable = 'site_content';
      sectionFilter = table;
    }

    app.get(route, async (req, res) => {
      try {
        let query = supabase.from(dbTable).select('*');
        if (req.query.public === 'true') query = query.eq('is_visible', true);
        
        // Content Sync Logic: Frames can show Gallery content too
        if (sectionFilter === 'frames') {
          const frameCompatibleGalleryCats = ['passport', 'acrylic', 'collage', 'certificate', 'badges'];
          const orFilter = `section.eq.frames,and(section.eq.gallery,category.in.(${frameCompatibleGalleryCats.join(',')}))`;
          query = query.or(orFilter);
        } else if (sectionFilter) {
          query = query.eq('section', sectionFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error(`❌ Supabase Error for ${route} (${dbTable}):`, error.message);
          return res.status(500).json({ error: error.message, details: error });
        }
        
        res.json(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(`❌ Critical API Error for ${route}:`, err.message);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    });
    
    // Protected Routes
    app.post(route, requireAuth, upload.single('image'), async (req, res) => {
      try {
        const body = { ...req.body };
        if (sectionFilter) body.section = sectionFilter;
        
        const filtered = filterBody(body, table);
        if (req.file) {
          const imgField = (table === 'testimonials') ? 'clientimage' : 'imagepath';
          filtered[imgField] = await uploadToSupabase(req.file);
        }
        
        const { data, error } = await supabase.from(dbTable).insert([filtered]).select();
        if (error) throw error;
        res.status(201).json({ success: true, data: data[0] });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put(`${route}/:id`, requireAuth, upload.single('image'), async (req, res) => {
      try {
        const { id } = req.params;
        const body = { ...req.body };
        if (sectionFilter) body.section = sectionFilter;
        
        const filtered = filterBody(body, table);
        if (req.file) {
          const imgField = (table === 'testimonials') ? 'clientimage' : 'imagepath';
          filtered[imgField] = await uploadToSupabase(req.file);
        }
        
        const { data, error } = await supabase.from(dbTable).update(filtered).eq('id', id).select();
        if (error) throw error;
        res.json({ success: true, data: data[0] });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.delete(`${route}/:id`, requireAuth, async (req, res) => {
      try {
        const { id } = req.params;
        const { error } = await supabase.from(dbTable).delete().eq('id', id);
        if (error) throw error;
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  });
});

// Temporary migration route (outside the loop)
app.post('/api/migrate-data', requireAuth, async (req, res) => {
  try {
    const sections = ['gallery', 'frames', 'corporate_gifts', 'hero_banners', 'testimonials'];
    let totalMigrated = 0;
    
    for (const section of sections) {
      const legacyTable = section === 'corporate_gifts' ? 'corporate_gifts' : section;
      const { data: legacyData, error: fetchErr } = await supabase.from(legacyTable).select('*');
      if (fetchErr) continue;
      
      if (legacyData && legacyData.length > 0) {
        const transformed = legacyData.map(item => {
          const obj = { ...item, section };
          delete obj.id;
          delete obj.created_at;
          return obj;
        });
        
        const { error: insertErr } = await supabase.from('site_content').upsert(transformed, { onConflict: 'imagepath,clientimage' });
        if (!insertErr) totalMigrated += transformed.length;
      }
    }
    res.json({ success: true, migrated: totalMigrated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings specific endpoints
app.get('/api/settings', handleGetSettings);
app.put('/api/settings/:id', requireAuth, handlePutSetting);
app.post('/api/settings', requireAuth, handlePutSetting); // Allow POST as alias for update

// Main Page Routes for Clean URLs
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const mainPages = [
  'about',
  'gallery',
  'contact',
  'frames',
  'testimonials',
  'corporate-gifting',
  'policy'
];

mainPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${page}.html`));
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
  res.redirect('/admin');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Start Server only if running directly (not as a serverless function)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// Export app for Vercel
module.exports = app;
