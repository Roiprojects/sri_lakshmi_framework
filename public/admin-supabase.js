// ── admin-supabase.js ──────────────────────────────────────────────────────
// All admin CRUD goes directly to Supabase REST API + Storage.
// No local Express server is required.
// ──────────────────────────────────────────────────────────────────────────

const SUPA_URL = window.APP_CONFIG.SUPABASE_URL;
const SUPA_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;
const HDR = {
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${SUPA_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// Map admin "type" → Supabase table
const TABLE = {
    gallery:         'gallery',
    frames:          'frames',
    testimonials:    'testimonials',
    corporate_gifts: 'corporate_gifts',
    hero_banners:    'hero_banners',
    home_gallery:    'site_content',
    about:           'site_content',
    categories:      'categories'
};

// site_content rows that need a section= filter
const SECTION = { home_gallery: 'home_gallery', about: 'about' };

// ── REST helpers ─────────────────────────────────────────────────────────────
async function dbGet(table, params) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}&order=created_at.desc`, { headers: HDR });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
async function dbInsert(table, payload) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: 'POST', headers: HDR, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
async function dbPatch(table, id, payload) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'PATCH', headers: HDR, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}
async function dbDelete(table, id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: { ...HDR, 'Prefer': '' } });
    if (!r.ok) throw new Error(await r.text());
}

// Settings uses text PK, not UUID
async function dbPatchSettings(id, value) {
    const r = await fetch(`${SUPA_URL}/rest/v1/settings?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: HDR, body: JSON.stringify({ value }) });
    if (!r.ok) throw new Error(await r.text());
}

// ── Storage upload ───────────────────────────────────────────────────────────
async function uploadFile(file) {
    const ext  = file.name.split('.').pop();
    const path = `admin/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const r = await fetch(`${SUPA_URL}/storage/v1/object/uploads/${path}`, {
        method: 'POST',
        headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}`, 'Content-Type': file.type },
        body: file
    });
    if (!r.ok) throw new Error('Upload failed: ' + await r.text());
    return `${SUPA_URL}/storage/v1/object/public/uploads/${path}`;
}

// ── Toast & Confirm ──────────────────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('successToast');
    document.getElementById('toastMsg').innerText = msg;
    t.style.display = 'flex'; t.style.opacity = '1';
    setTimeout(() => {
        t.style.transition = 'opacity .5s'; t.style.opacity = '0';
        setTimeout(() => { t.style.display = 'none'; t.style.opacity = '1'; }, 500);
    }, 2200);
}
function customConfirm(msg) {
    return new Promise(resolve => {
        const modal = document.getElementById('confirmModal');
        const ok    = document.getElementById('confirmBtn');
        const no    = document.getElementById('cancelBtn');
        document.getElementById('confirmMsg').innerText = msg;
        modal.style.display = 'flex';
        const done = v => { modal.style.display='none'; ok.onclick=null; no.onclick=null; resolve(v); };
        ok.onclick = () => done(true);
        no.onclick = () => done(false);
    });
}

// ── Image preview ────────────────────────────────────────────────────────────
function previewImage(input, previewId) {
    const p = document.getElementById(previewId);
    if (input.files && input.files.length > 0) {
        p.innerHTML = ''; p.style.display = 'flex'; p.style.flexWrap = 'wrap'; p.style.gap = '10px';
        Array.from(input.files).forEach(f => {
            const r = new FileReader();
            r.onload = e => { p.innerHTML += `<div><img src="${e.target.result}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #ccc;"></div>`; };
            r.readAsDataURL(f);
        });
    } else { p.style.display = 'none'; p.innerHTML = ''; }
}

// ── Render grid ──────────────────────────────────────────────────────────────
function renderGrid(grid, type, data) {
    grid.innerHTML = '';
    if (!data || !data.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#94a3b8;background:#fff;border-radius:12px;border:1px dashed #ccc;">No records found.</div>';
        return;
    }
    data.forEach(item => {
        const imgPath = item.imagepath || item.clientimage || '';
        const img = imgPath ? (imgPath.startsWith('http') ? imgPath : window.APP_CONFIG.getAssetUrl(imgPath)) : 'assets/placeholder.jpg';
        const title = item.title || item.clientname || 'Untitled';
        const desc  = item.description || item.quote || item.subtitle || '';
        const badge = item.category || item.badgetext || (item.rating ? item.rating + ' ★' : null);
        const vis   = item.is_visible !== false;
        const el    = document.createElement('div');
        el.className = 'data-item';
        el.innerHTML = `
            <img src="${img}" class="data-item-img" style="opacity:${vis?1:0.4}" onerror="this.src='assets/placeholder.jpg'">
            ${vis
                ? '<div class="status-badge"><i class="fas fa-circle" style="color:#10b981;font-size:8px;margin-right:4px;"></i> Live</div>'
                : '<div class="status-badge hidden"><i class="fas fa-eye-slash"></i> Hidden</div>'}
            <div class="data-item-info" style="opacity:${vis?1:0.5}">
                ${badge ? `<div class="category-tag mb-2">${badge}</div>` : ''}
                <h4 style="margin-top:8px;">${title}</h4>
                <p>${desc.substring(0,75)}${desc.length>75?'...':''}</p>
            </div>
            <div class="data-item-actions" style="grid-template-columns:1fr 1fr 1fr;">
                <button onclick="toggleVisibility('${type}','${item.id}',${!vis})" class="action-btn btn-toggle ${vis?'':'is-hidden'}">
                    <i class="fas ${vis?'fa-eye-slash':'fa-eye'}"></i> ${vis?'Hide':'Show'}
                </button>
                <button onclick="editItem('${type}','${item.id}')" class="action-btn" style="border-right:1px solid var(--border);">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteItem('${type}','${item.id}')" class="action-btn btn-del">
                    <i class="fas fa-trash-alt"></i> Del
                </button>
            </div>`;
        grid.appendChild(el);
    });
}

// ── Fetch & display section data ─────────────────────────────────────────────
async function fetchData(type) {
    const grid = document.getElementById(type + 'Grid');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#94a3b8;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';
    try {
        const table = TABLE[type];
        const params = SECTION[type] ? `section=eq.${SECTION[type]}` : 'select=*';
        const data = await dbGet(table, params);
        renderGrid(grid, type, data);
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1;color:#ef4444;padding:20px;background:#fef2f2;border-radius:12px;text-align:center;">Error: ${err.message}</div>`;
    }
}

// ── Categories ────────────────────────────────────────────────────────────────
async function fetchCategories() {
    try {
        const data = await dbGet('categories', 'select=*');
        const gal   = data.filter(c => c.type === 'gallery');
        const frame = data.filter(c => c.type === 'frame');
        renderCategoryGrid('galleryCatGrid', gal);
        renderCategoryGrid('frameCatGrid', frame);
        populateSelect('galCategorySelect', gal);
        populateSelect('frameCategorySelect', frame);
    } catch(e) { console.warn('fetchCategories failed', e); }
}
function renderCategoryGrid(gridId, cats) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    if (!cats.length) { grid.innerHTML = '<div style="grid-column:1/-1;color:#94a3b8;font-size:.9rem;">No categories defined.</div>'; return; }
    cats.forEach(c => {
        const el = document.createElement('div');
        el.className = 'data-item';
        el.style.cssText = 'padding:15px;display:flex;justify-content:space-between;align-items:center;';
        el.innerHTML = `<span style="font-weight:500;">${c.name}</span>
            <button onclick="deleteCategory('${c.id}')" class="btn-del" style="background:none;border:none;cursor:pointer;"><i class="fas fa-trash"></i></button>`;
        grid.appendChild(el);
    });
}
function populateSelect(selectId, cats) {
    const s = document.getElementById(selectId);
    if (!s) return;
    const cur = s.value;
    s.innerHTML = '<option value="" disabled selected>Select Category...</option>';
    cats.forEach(c => { const o = document.createElement('option'); o.value = c.name; o.textContent = c.name; s.appendChild(o); });
    if (cur) s.value = cur;
}
async function addCategory(type) {
    const inputId = type === 'gallery' ? 'galCatName' : 'frameCatName';
    const input = document.getElementById(inputId);
    const name  = input.value.trim();
    if (!name) return;
    if (!await customConfirm(`Create "${name}" as a ${type} category?`)) return;
    try { await dbInsert('categories', { name, type }); input.value = ''; showToast('Category created!'); fetchCategories(); }
    catch(e) { alert('Failed: ' + e.message); }
}
async function syncCategories(type) {
    if (!await customConfirm(`Scan ${type} items and add missing categories?`)) return;
    try {
        const items    = await dbGet(type === 'gallery' ? 'gallery' : 'frames', 'select=category');
        const allCats  = await dbGet('categories', 'select=name,type');
        const catType  = type === 'gallery' ? 'gallery' : 'frame';
        const existing = allCats.filter(c => c.type === catType).map(c => c.name.toLowerCase());
        const unique   = [...new Set(items.map(i => i.category).filter(Boolean))];
        let added = 0;
        for (const n of unique) { if (!existing.includes(n.toLowerCase())) { await dbInsert('categories', { name: n, type: catType }); added++; } }
        showToast(`Sync done! Added ${added} categories.`); fetchCategories();
    } catch(e) { alert('Sync failed: ' + e.message); }
}
async function deleteCategory(id) {
    if (!await customConfirm('Delete this category?')) return;
    try { await dbDelete('categories', id); showToast('Category removed'); fetchCategories(); }
    catch(e) { alert('Failed: ' + e.message); }
}

// ── Edit item ─────────────────────────────────────────────────────────────────
async function editItem(type, id) {
    try {
        const data = await dbGet(TABLE[type], `id=eq.${id}`);
        const item = data[0]; if (!item) return;
        const formMap = { corporate_gifts:'corporate', hero_banners:'heroBanners', home_gallery:'homeGallery', about:'about' };
        const formId  = formMap[type] || type;
        const form    = document.getElementById(`${formId}Form`);
        window.editingState[type] = id;
        const ind = document.getElementById(`${type}EditIndicator`);
        if (ind) ind.style.display = 'flex';
        const btn = document.getElementById(`${formId}SubmitBtn`);
        if (btn) btn.innerHTML = '<i class="fas fa-save" style="margin-right:8px;"></i> Update Item';
        Object.keys(item).forEach(k => { const el = form.querySelector(`[name="${k}"]`); if (el && el.type !== 'file') el.value = item[k] || ''; });
        const previewId = `${type==='corporate_gifts'?'corporate':(type==='hero_banners'?'hero':type)}Preview`;
        const prev = document.getElementById(previewId);
        const imgP = item.imagepath || item.clientimage;
        if (prev && imgP) { prev.innerHTML = `<img src="${imgP.startsWith('http')?imgP:'/'+imgP}">`; prev.style.display = 'flex'; }
        form.scrollIntoView({ behavior: 'smooth' });
    } catch(e) { console.error('editItem:', e); }
}
function cancelEdit(type) {
    window.editingState[type] = null;
    const ind = document.getElementById(`${type}EditIndicator`);
    if (ind) ind.style.display = 'none';
    const formMap = { corporate_gifts:'corporate', hero_banners:'heroBanners', home_gallery:'homeGallery', about:'about' };
    const formId  = formMap[type] || type;
    const form = document.getElementById(`${formId}Form`);
    if (form) form.reset();
    const btn = document.getElementById(`${formId}SubmitBtn`);
    if (btn) {
        const labels = { gallery:'Add to Full Gallery', frames:'Add New Product', hero_banners:'Save Hero Banner', home_gallery:'Add to Home Preview', about:'Save About Content', corporate_gifts:'Publish Corporate Item', testimonials:'Publish Testimonial' };
        btn.innerHTML = `<i class="fas fa-plus"></i> ${labels[type]||'Publish Item'}`;
    }
    const previewId = `${type==='corporate_gifts'?'corporate':(type==='hero_banners'?'hero':type)}Preview`;
    const prev = document.getElementById(previewId);
    if (prev) { prev.style.display='none'; prev.innerHTML=''; }
}

// ── Form attach ───────────────────────────────────────────────────────────────
function attachForm(formId, type) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn    = e.target.querySelector('button[type="submit"]');
        const orig   = btn.innerHTML;
        const isEdit = window.editingState[type] !== null;
        if (!await customConfirm(`${isEdit?'Update':'Publish'} this ${type}?`)) return;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isEdit?'Updating...':'Uploading...'}`;
        try {
            const buildPayload = async (fileOverride) => {
                const p = {};
                new FormData(e.target).forEach((v,k) => { if (k !== 'image') p[k] = v; });
                if (SECTION[type]) p.section = SECTION[type];
                const fileInput = e.target.querySelector('input[type="file"]');
                const file = fileOverride || (fileInput && fileInput.files[0]);
                if (file) { btn.innerHTML = '<i class="fas fa-cloud-upload-alt fa-spin"></i> Uploading image...'; p.imagepath = await uploadFile(file); }
                return p;
            };
            const fileInput  = e.target.querySelector('input[type="file"]');
            const multiFiles = !isEdit && fileInput && fileInput.hasAttribute('multiple') && fileInput.files.length > 1;
            if (multiFiles) {
                const files = Array.from(fileInput.files); let ok = 0;
                for (let i = 0; i < files.length; i++) { btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${i+1}/${files.length}...`; await dbInsert(TABLE[type], await buildPayload(files[i])); ok++; }
                showToast(`Published ${ok} items!`);
            } else if (isEdit) {
                await dbPatch(TABLE[type], window.editingState[type], await buildPayload(null));
                showToast('Changes saved!');
            } else {
                await dbInsert(TABLE[type], await buildPayload(null));
                showToast('Published successfully!');
            }
            cancelEdit(type); fetchData(type);
        } catch(err) { alert('Error: ' + err.message); }
        btn.innerHTML = orig;
    });
}

// ── Delete & Toggle ───────────────────────────────────────────────────────────
async function deleteItem(type, id) {
    if (!await customConfirm('Permanently delete this item?')) return;
    try { await dbDelete(TABLE[type], id); showToast('Deleted!'); fetchData(type); }
    catch(e) { alert('Delete failed: ' + e.message); }
}
async function toggleVisibility(type, id, makeVisible) {
    try { await dbPatch(TABLE[type], id, { is_visible: makeVisible }); fetchData(type); }
    catch(e) { alert('Error: ' + e.message); }
}

// ── Settings ──────────────────────────────────────────────────────────────────
async function loadSettings() {
    try {
        const data = await dbGet('settings', "id=in.(phone,whatsapp)&select=id,value");
        data.forEach(r => { const el = document.getElementById(r.id + 'Input'); if (el) el.value = r.value || ''; });
    } catch(e) { console.warn('loadSettings failed', e); }
}

// ── Tab navigation ────────────────────────────────────────────────────────────
const TITLES = {
    gallery:'Gallery Database', gallery_categories:'Gallery Categories',
    frames:'Frames & Products', frame_categories:'Frame Categories',
    testimonials:'Client Reviews', corporate_gifts:'Corporate Options',
    hero_banners:'Home Hero Banners', settings:'Site-Wide Settings',
    home_gallery:'Home Preview Items', about:'About Page Content'
};

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        const t = link.getAttribute('data-target');
        document.getElementById(t).classList.add('active');
        document.getElementById('pageTitle').innerText = TITLES[t] || 'Management';
        if (t === 'settings') loadSettings();
        else if (t === 'gallery_categories' || t === 'frame_categories') fetchCategories();
        else { if (t === 'gallery' || t === 'frames') fetchCategories(); fetchData(t); }
    });
});

// ── Settings form ─────────────────────────────────────────────────────────────
document.getElementById('settingsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    try {
        await dbPatchSettings('phone',    document.getElementById('phoneInput').value);
        await dbPatchSettings('whatsapp', document.getElementById('whatsappInput').value);
        showToast('Settings saved!');
    } catch(err) { alert('Error: ' + err.message); }
    btn.innerHTML = '<i class="fas fa-save" style="margin-right:8px;"></i> Save Global Changes';
});

// ── Init ──────────────────────────────────────────────────────────────────────
window.editingState = { gallery:null, frames:null, testimonials:null, corporate_gifts:null, hero_banners:null, home_gallery:null, about:null };

attachForm('galleryForm',     'gallery');
attachForm('framesForm',      'frames');
attachForm('testimonialsForm','testimonials');
attachForm('corporateForm',   'corporate_gifts');
attachForm('heroBannersForm', 'hero_banners');
attachForm('homeGalleryForm', 'home_gallery');
attachForm('aboutForm',       'about');

fetchData('home_gallery');
fetchCategories();
