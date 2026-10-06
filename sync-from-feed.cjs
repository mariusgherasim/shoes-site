// sync-from-feed.cjs
// ============================================================
// Sincronizare products.json cu feed-urile XML Benvenuti + Gryxx + Otter + Picadili
// Ruleaza prin: sync-from-feed.bat
//
// Ce face:
//   - Actualizeaza preturile (price + old_price) din feed
//   - Adauga produse noi din feed care lipsesc din JSON
//   - Dezactiveaza produse din JSON absente din feed
//   - Genereaza sluguri pentru produsele noi
//   - Clasifica Gryxx pe categorii + subcategorii
//
// Feed-uri acceptate (pune-le in acelasi folder cu scriptul):
//   Benvenuti: feed_benvenuti.xml  sau  feed_72d6dd7c5.xml
//   Gryxx:     feed_gryxx.xml      sau  feed_82d2c2bf6.xml
//   Otter:     feed_otter.xml      sau  feed_7a8d24d4f.xml
// ============================================================

const fs   = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'src', 'data', 'products.json');
const REPORT_PATH   = path.join(__dirname, 'sync-report.json');

// ── Configurare feed-uri ──────────────────────────────────────
const FEED_CONFIG = {
  'benvenuti.com': {
    files: ['feed_benvenuti.xml', 'feed_72d6dd7c5.xml', 'feed_72d6dd7c5_1.xml'],
    idPrefix: '',          // ID-urile benvenuti sunt stocate fara prefix
    stripPrefix: '',
  },
  'gryxx.ro': {
    files: ['feed_gryxx.xml', 'feed_82d2c2bf6.xml', 'feed_82d2c2bf6_1.xml'],
    idPrefix: 'gryxx-',
    stripPrefix: 'gryxx-',
  },
  'otter.ro': {
    files: ['feed_otter.xml', 'feed_7a8d24d4f.xml', 'feed_7a8d24d4f_1.xml'],
    idPrefix: 'otter-',
    stripPrefix: 'otter-',
  },
  'picadili.ro': {
    files: ['feed_picadili.xml', 'feed_f741a4c2e.xml', 'feed_f741a4c2e_1.xml'],
    idPrefix: 'picadili-',
    stripPrefix: 'picadili-',
  },
};

// ── Categorii Benvenuti (din feed) → categorii site ──────────
function getBenvenutiCategory(catRaw) {
  if (!catRaw) return ['accesorii'];
  const c = catRaw.toLowerCase();
  const result = [];
  if (c.includes('femei') || c.includes('fete') || c.includes('fetite')) result.push('femei');
  if (c.includes('barbati') || c.includes('bărbați') || c.includes('baieti') || c.includes('băieți')) result.push('barbati');
  if (c.includes('copii')) result.push('copii');
  if (c.includes('accesorii')) result.push('accesorii');
  if (c.includes('cadouri')) result.push('cadouri');
  return result.length > 0 ? result : ['accesorii'];
}

// ── Categorii Gryxx (din feed) → categorii site ──────────────
function getGryxxCategory(catRaw) {
  if (!catRaw) return ['accesorii'];
  const c = catRaw.toLowerCase();
  const result = [];
  if (c.includes('femei') || c.includes('fetite')) result.push('femei');
  if (c.includes('barbati') || c.includes('baieti')) result.push('barbati');
  return result.length > 0 ? result : ['accesorii'];
}

// ── Subcategorii Gryxx (din titlu + categorie) ───────────────
// Ordinea conteaza — primul match castiga
const SUBCATEGORY_RULES = [
  // FEMEI
  { slug: 'sneakers-femei',       cat: 'femei',   rx: /sneakers?/i },
  { slug: 'pantofi-sport-femei',  cat: 'femei',   rx: /sport|running|trail/i },
  { slug: 'sandale-femei',        cat: 'femei',   rx: /sandal/i },
  { slug: 'balerini-femei',       cat: 'femei',   rx: /balerina|balerini|ballet flat/i },
  { slug: 'saboti-femei-crocs',   cat: 'femei',   rx: /crocs/i },
  { slug: 'saboti-femei',         cat: 'femei',   rx: /sabot|papuci|clog|mule/i },
  { slug: 'pantofi-femei',        cat: 'femei',   rx: /pantof|oxford|loafer|mocasin|derby/i },
  // BARBATI
  { slug: 'sneakers-barbati',     cat: 'barbati', rx: /sneakers?/i },
  { slug: 'pantofi-sport-barbati',cat: 'barbati', rx: /sport|running|trail/i },
  { slug: 'mocasini-barbati',     cat: 'barbati', rx: /mocasin|loafer/i },
  { slug: 'pantofi-barbati',      cat: 'barbati', rx: /pantof|oxford|derby/i },
];

function getGryxxSubcategory(title, categories) {
  for (const rule of SUBCATEGORY_RULES) {
    if (categories.includes(rule.cat) && rule.rx.test(title)) {
      return rule.slug;
    }
  }
  return null;
}


// ── Categorii Otter — din câmpul category "Femei > Pantofi sport" ──
function getOtterCategory(catRaw) {
  if (!catRaw) return ['accesorii'];
  const gen = catRaw.split('>')[0].trim().toLowerCase();
  const result = [];
  if (gen.includes('femei')) result.push('femei');
  else if (gen.includes('barbati') || gen.includes('bărbați')) result.push('barbati');
  else if (gen.includes('fetite') || gen.includes('fetițe')) { result.push('femei'); result.push('copii'); }
  else if (gen.includes('baieti') || gen.includes('băieți')) { result.push('barbati'); result.push('copii'); }
  else if (gen.includes('copii')) result.push('copii');
  return result.length > 0 ? [...new Set(result)] : ['accesorii'];
}

const OTTER_SUBCAT_MAP = {
  'pantofi sport': { femei: 'pantofi-sport-femei', barbati: 'pantofi-sport-barbati' },
  'sneakers':      { femei: 'sneakers-femei',       barbati: 'sneakers-barbati' },
  'ghete':         { femei: 'pantofi-femei',         barbati: 'pantofi-barbati' },
  'botine':        { femei: 'pantofi-femei' },
  'cizme':         { femei: 'pantofi-femei' },
  'pantofi eleganti': { femei: 'pantofi-femei', barbati: 'pantofi-barbati' },
  'pantofi casual':   { femei: 'pantofi-femei', barbati: 'pantofi-barbati' },
  'mocasini':      { femei: 'pantofi-femei', barbati: 'mocasini-barbati' },
  'balerini':      { femei: 'balerini-femei' },
  'papuci':        { femei: 'saboti-femei' },
  'sandale':       { femei: 'sandale-femei' },
  'genti si posete': { femei: 'poseta' },
  'curele':        { barbati: 'curea-barbati' },
};

function getOtterSubcat(catRaw, cats) {
  if (!catRaw) return null;
  const typ = (catRaw.split('>')[1] || '').trim().toLowerCase();
  for (const [key, map] of Object.entries(OTTER_SUBCAT_MAP)) {
    if (typ.includes(key)) {
      for (const cat of cats) {
        if (map[cat]) return map[cat];
      }
    }
  }
  return null;
}


// ── Categorii Picadili ────────────────────────────────────────
function getPicadiliCategory(catRaw) {
  const cat = (catRaw || '').toLowerCase();
  const result = [];
  if (cat === 'femei') { result.push('femei'); result.push('accesorii'); }
  else if (cat === 'barbati') { result.push('barbati'); result.push('accesorii'); }
  else if (cat === 'bijuterii argint dama') { result.push('bijuterii'); result.push('femei'); }
  else if (cat === 'accesorii costum') { result.push('barbati'); result.push('accesorii'); }
  else { result.push('accesorii'); }
  return [...new Set(result)];
}

// ── Utilitare ─────────────────────────────────────────────────
function slugify(s) {
  return (s || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
    .toLowerCase().slice(0, 80);
}

function parsePrice(val) {
  const f = parseFloat(val);
  return isNaN(f) ? null : f;
}

function decodeHtml(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function getField(item, name) {
  const m = item.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
  return m ? decodeHtml(m[1].trim()) : null;
}

function parseItems(content) {
  const items = [];
  const rx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = rx.exec(content)) !== null) items.push(m[1]);
  return items;
}

function findFeed(fileList) {
  for (const f of fileList) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function makeSlug(title, pid, existingSlugs) {
  let base = slugify(title || `produs-${pid}`);
  let slug = base, i = 2;
  while (existingSlugs.has(slug)) slug = `${base}-${i++}`;
  existingSlugs.add(slug);
  return slug;
}

// ── Main ──────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║  SYNC STYLE — Benvenuti + Gryxx → products.json  ║');
console.log('╚══════════════════════════════════════════════════╝\n');

if (!fs.existsSync(PRODUCTS_PATH)) {
  console.error(`❌ Nu găsesc: ${PRODUCTS_PATH}`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const existingSlugs = new Set(products.map(p => p.slug).filter(Boolean));
const report = { timestamp: new Date().toISOString(), sources: {} };

console.log(`📦 products.json curent: ${products.length} produse\n`);

// ── PROCESARE BENVENUTI ───────────────────────────────────────
const benvFeedPath = findFeed(FEED_CONFIG['benvenuti.com'].files);
if (!benvFeedPath) {
  console.log('⚠️  Feed Benvenuti negăsit — sar peste.');
} else {
  console.log(`=== BENVENUTI ===`);
  console.log(`  Feed: ${path.basename(benvFeedPath)}`);

  const benvContent = fs.readFileSync(benvFeedPath, 'utf8');
  const benvRaw = parseItems(benvContent);
  const benvActive = {};
  const benvAll = new Set();

  for (const item of benvRaw) {
    const pid = getField(item, 'product_id');
    benvAll.add(pid);
    if (getField(item, 'product_active') === 'true') benvActive[pid] = item;
  }

  console.log(`  Feed: ${benvRaw.length} total, ${Object.keys(benvActive).length} active`);

  const benvJson = products.filter(p => p.source_site === 'benvenuti.com');
  const benvJsonPids = new Set(benvJson.map(p => String(p.id)));

  let upd = 0, deact = 0, added = 0;

  // Actualizeaza existente
  for (const p of products) {
    if (p.source_site !== 'benvenuti.com') continue;
    const pid = String(p.id);
    if (benvActive[pid]) {
      const item = benvActive[pid];
      const fp = parsePrice(getField(item, 'price')) || 0;
      const fo = parsePrice(getField(item, 'old_price'));
      const imgs = (getField(item, 'image_urls') || '').split(',');
      p.price = fp;
      p.old_price = (fo && fo > fp) ? fo : null;
      p.availability = true;
      p.draft = false;
      if (imgs[0] && imgs[0].trim()) p.image_url = imgs[0].trim();
      upd++;
    } else if (!benvAll.has(pid)) {
      p.availability = false;
      p.draft = true;
      deact++;
    }
  }

  // Adauga produse noi
  for (const [pid, item] of Object.entries(benvActive)) {
    if (benvJsonPids.has(pid)) continue;
    const fp = parsePrice(getField(item, 'price')) || 0;
    const fo = parsePrice(getField(item, 'old_price'));
    const imgs = (getField(item, 'image_urls') || '').split(',');
    const title = getField(item, 'title') || '';
    const cats = getBenvenutiCategory(getField(item, 'category'));

    products.push({
      id: parseInt(pid) || pid,
      source_site: 'benvenuti.com',
      brand: getField(item, 'brand') || 'Benvenuti',
      title,
      category: cats,
      price: fp,
      old_price: (fo && fo > fp) ? fo : null,
      offer_end: null,
      currency: 'RON',
      availability: true,
      draft: false,
      recomandat: false,
      featured: false,
      image_url: imgs[0] && imgs[0].trim() ? imgs[0].trim() : null,
      official_url: getField(item, 'url'),
      affiliate_url: getField(item, 'aff_code'),
      specs: {},
      slug: makeSlug(title, pid, existingSlugs),
    });
    added++;
  }

  console.log(`  ✅ actualizate: ${upd} | ➕ adăugate: ${added} | 🗑️  dezactivate: ${deact}`);
  report.sources['benvenuti.com'] = { updated: upd, added, deactivated: deact };
}

// ── PROCESARE GRYXX ──────────────────────────────────────────
const gryxxFeedPath = findFeed(FEED_CONFIG['gryxx.ro'].files);
if (!gryxxFeedPath) {
  console.log('\n⚠️  Feed Gryxx negăsit — sar peste.');
} else {
  console.log(`\n=== GRYXX ===`);
  console.log(`  Feed: ${path.basename(gryxxFeedPath)}`);

  const gryxxContent = fs.readFileSync(gryxxFeedPath, 'utf8');
  const gryxxRaw = parseItems(gryxxContent);
  const gryxxActive = {};
  const gryxxAll = new Set();

  for (const item of gryxxRaw) {
    const pid = getField(item, 'product_id');
    gryxxAll.add(pid);
    if (getField(item, 'product_active') === 'true') gryxxActive[pid] = item;
  }

  console.log(`  Feed: ${gryxxRaw.length} total, ${Object.keys(gryxxActive).length} active`);

  const gryxxJson = products.filter(p => p.source_site === 'gryxx.ro');
  const gryxxJsonPids = new Set(gryxxJson.map(p => String(p.id).replace('gryxx-', '')));

  let upd = 0, deact = 0, added = 0;

  // Actualizeaza existente
  for (const p of products) {
    if (p.source_site !== 'gryxx.ro') continue;
    const pid = String(p.id).replace('gryxx-', '');
    if (gryxxActive[pid]) {
      const item = gryxxActive[pid];
      const fp = parsePrice(getField(item, 'price')) || 0;
      const fo = parsePrice(getField(item, 'old_price'));
      const imgs = (getField(item, 'image_urls') || '').split(',');
      p.price = fp;
      p.old_price = (fo && fo > fp) ? fo : null;
      p.availability = true;
      p.draft = false;
      if (imgs[0] && imgs[0].trim()) p.image_url = imgs[0].trim();
      upd++;
    } else if (!gryxxAll.has(pid)) {
      p.availability = false;
      p.draft = true;
      deact++;
    }
  }

  // Adauga produse noi
  for (const [pid, item] of Object.entries(gryxxActive)) {
    if (gryxxJsonPids.has(pid)) continue;
    const fp = parsePrice(getField(item, 'price')) || 0;
    const fo = parsePrice(getField(item, 'old_price'));
    const imgs = (getField(item, 'image_urls') || '').split(',');
    const title = getField(item, 'title') || '';
    const cats = getGryxxCategory(getField(item, 'category'));
    const subcat = getGryxxSubcategory(title, cats);

    products.push({
      id: `gryxx-${pid}`,
      source_site: 'gryxx.ro',
      brand: getField(item, 'brand') || 'Gryxx',
      title,
      category: cats,
      subcategory: subcat,
      price: fp,
      old_price: (fo && fo > fp) ? fo : null,
      offer_end: null,
      currency: 'RON',
      availability: true,
      draft: false,
      recomandat: false,
      featured: false,
      image_url: imgs[0] && imgs[0].trim() ? imgs[0].trim() : null,
      official_url: getField(item, 'url'),
      affiliate_url: getField(item, 'aff_code'),
      specs: {},
      slug: makeSlug(title, pid, existingSlugs),
    });
    added++;
  }

  console.log(`  ✅ actualizate: ${upd} | ➕ adăugate: ${added} | 🗑️  dezactivate: ${deact}`);
  report.sources['gryxx.ro'] = { updated: upd, added, deactivated: deact };
}


// ── PROCESARE OTTER ───────────────────────────────────────────
const otterFeedPath = findFeed(FEED_CONFIG['otter.ro'].files);
if (!otterFeedPath) {
  console.log('\n⚠️  Feed Otter negăsit — sar peste.');
} else {
  console.log(`\n=== OTTER ===`);
  console.log(`  Feed: ${path.basename(otterFeedPath)}`);

  const otterContent = fs.readFileSync(otterFeedPath, 'utf8');
  const otterRaw = parseItems(otterContent);
  const otterActive = {};
  const otterAll = new Set();

  for (const item of otterRaw) {
    const pid = getField(item, 'product_id');
    if (!pid) continue;
    otterAll.add(pid);
    if (getField(item, 'product_active') !== 'false') {
      otterActive[pid] = item;
    }
  }

  console.log(`  Feed: ${otterRaw.length} total, ${Object.keys(otterActive).length} active`);

  const otterJsonPids = new Set(
    products.filter(p => p.source_site === 'otter.ro').map(p => String(p.id).replace('otter-', ''))
  );

  let oUpd = 0, oAdded = 0, oDeact = 0;

  // Actualizeaza existente
  for (const p of products) {
    if (p.source_site !== 'otter.ro') continue;
    const pid = String(p.id).replace('otter-', '');
    if (otterActive[pid]) {
      const item = otterActive[pid];
      const fp = parsePrice(getField(item, 'price')) || 0;
      const fo = parsePrice(getField(item, 'old_price'));
      const imgs = (getField(item, 'image_urls') || '').split(',');
      p.price = fp;
      p.old_price = (fo && fo > fp) ? fo : null;
      p.availability = true;
      p.draft = false;
      if (imgs[0] && imgs[0].trim()) p.image_url = imgs[0].trim();
      if (getField(item, 'url')) p.official_url = getField(item, 'url');
      oUpd++;
    } else if (!otterAll.has(pid)) {
      p.availability = false;
      p.draft = true;
      oDeact++;
    }
  }

  // Adauga produse noi
  for (const [pid, item] of Object.entries(otterActive)) {
    if (otterJsonPids.has(pid)) continue;
    const fp = parsePrice(getField(item, 'price')) || 0;
    const fo = parsePrice(getField(item, 'old_price'));
    const imgs = (getField(item, 'image_urls') || '').split(',');
    const title = getField(item, 'title') || '';
    const catRaw = getField(item, 'category') || '';
    const cats = getOtterCategory(catRaw);
    const subcat = getOtterSubcat(catRaw, cats);
    const brand = getField(item, 'brand') || 'Otter';

    const slug = makeSlug(title, pid, existingSlugs);
    const prod = {
      id: `otter-${pid}`,
      source_site: 'otter.ro',
      brand,
      title,
      category: cats,
      price: fp,
      old_price: (fo && fo > fp) ? fo : null,
      offer_end: null,
      currency: 'RON',
      availability: true,
      draft: false,
      recomandat: false,
      featured: false,
      image_url: imgs[0] && imgs[0].trim() ? imgs[0].trim() : null,
      official_url: getField(item, 'url'),
      affiliate_url: getField(item, 'aff_code'),
      specs: {},
      slug,
    };
    if (subcat) prod.subcategory = subcat;
    products.push(prod);
    oAdded++;
  }

  console.log(`  ✅ actualizate: ${oUpd} | ➕ adăugate: ${oAdded} | 🗑️  dezactivate: ${oDeact}`);
  report.sources['otter.ro'] = { updated: oUpd, added: oAdded, deactivated: oDeact };
}


// ── PROCESARE PICADILI ────────────────────────────────────────
const picadiliFeedPath = findFeed(FEED_CONFIG['picadili.ro'].files);
if (!picadiliFeedPath) {
  console.log('\n⚠️  Feed Picadili negăsit — sar peste.');
} else {
  console.log(`\n=== PICADILI ===`);
  console.log(`  Feed: ${path.basename(picadiliFeedPath)}`);

  const picadiliContent = fs.readFileSync(picadiliFeedPath, 'utf8');
  const picadiliRaw = parseItems(picadiliContent);
  const picadiliActive = {};
  const picadiliAll = new Set();

  for (const item of picadiliRaw) {
    const pid = getField(item, 'product_id');
    if (!pid) continue;
    picadiliAll.add(pid);
    if (getField(item, 'product_active') === 'true') picadiliActive[pid] = item;
  }

  console.log(`  Feed: ${picadiliRaw.length} total, ${Object.keys(picadiliActive).length} active`);

  const picadiliJsonPids = new Set(
    products.filter(p => p.source_site === 'picadili.ro').map(p => String(p.id).replace('picadili-', ''))
  );

  let pUpd = 0, pAdded = 0, pDeact = 0;

  for (const p of products) {
    if (p.source_site !== 'picadili.ro') continue;
    const pid = String(p.id).replace('picadili-', '');
    if (picadiliActive[pid]) {
      const item = picadiliActive[pid];
      const fp = parsePrice(getField(item, 'price')) || 0;
      const fo = parsePrice(getField(item, 'old_price'));
      const imgs = (getField(item, 'image_urls') || '').split(',');
      p.price = fp;
      p.old_price = (fo && fo > fp) ? fo : null;
      p.availability = true;
      p.draft = false;
      if (imgs[0] && imgs[0].trim()) p.image_url = imgs[0].trim();
      pUpd++;
    } else if (!picadiliAll.has(pid)) {
      p.availability = false;
      p.draft = true;
      pDeact++;
    }
  }

  for (const [pid, item] of Object.entries(picadiliActive)) {
    if (picadiliJsonPids.has(pid)) continue;
    const fp = parsePrice(getField(item, 'price')) || 0;
    const fo = parsePrice(getField(item, 'old_price'));
    const imgs = (getField(item, 'image_urls') || '').split(',');
    const title = getField(item, 'title') || '';
    const cats = getPicadiliCategory(getField(item, 'category'));
    const brand = getField(item, 'brand') || 'Picadili';
    const slug = makeSlug(title, pid, existingSlugs);

    products.push({
      id: `picadili-${pid}`,
      source_site: 'picadili.ro',
      brand, title,
      category: cats,
      subcategory_raw: getField(item, 'subcategory'),
      price: fp,
      old_price: (fo && fo > fp) ? fo : null,
      offer_end: null,
      currency: 'RON',
      availability: true,
      draft: false,
      recomandat: false,
      featured: false,
      image_url: imgs[0] && imgs[0].trim() ? imgs[0].trim() : null,
      official_url: getField(item, 'url'),
      affiliate_url: getField(item, 'aff_code'),
      specs: {},
      slug,
    });
    pAdded++;
  }

  console.log(`  ✅ actualizate: ${pUpd} | ➕ adăugate: ${pAdded} | 🗑️  dezactivate: ${pDeact}`);
  report.sources['picadili.ro'] = { updated: pUpd, added: pAdded, deactivated: pDeact };
}

// ── SUMAR + SALVARE ───────────────────────────────────────────
const active = products.filter(p => !p.draft);
const withOld = active.filter(p => p.old_price).length;
const sizeMB = (JSON.stringify(products).length / 1e6).toFixed(1);

const bySrc = {};
for (const p of active) bySrc[p.source_site] = (bySrc[p.source_site] || 0) + 1;

console.log('\n========================================');
console.log(`  Total produse: ${products.length}`);
console.log(`  Active: ${active.length}`);
for (const [src, cnt] of Object.entries(bySrc)) console.log(`    ${src}: ${cnt}`);
console.log(`  Cu reducere (old_price): ${withOld}`);
console.log(`  Dimensiune fișier: ${sizeMB} MB`);
console.log('========================================\n');

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products), 'utf8');
fs.writeFileSync(REPORT_PATH, JSON.stringify({ ...report, summary: { total: products.length, active: active.length, with_old_price: withOld, size_mb: parseFloat(sizeMB) } }, null, 2), 'utf8');

console.log(`✅ Salvat: ${PRODUCTS_PATH}`);
console.log(`📋 Raport: ${REPORT_PATH}`);
console.log('\n⏭️  Acum faci:');
console.log('   git pull -X ours');
console.log('   git add src/data/products.json');
console.log('   git commit -m "chore: sync feeds local"');
console.log('   git push\n');
