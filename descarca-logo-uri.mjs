// DESCARCA LOGO-URI — styleaccessories.eu
// Ruleaza din folderul site-ului (shoes-site):   node descarca-logo-uri.mjs
//                                    sau dublu-click pe descarca-logo-uri.bat
//
// Lista de branduri se calculeaza singura din products.json, exact ca pe site:
// brandurile care apar pe randul „Branduri" al categoriilor si in fereastra de cautare
// (minimum 5 produse, primele 24 pe categorie).
// Pentru fiecare brand cauta logo-ul in 2 surse:
//   1. Wikidata / Wikimedia Commons (logo-uri SVG curate, pentru brandurile mari)
//   2. Site-ul oficial al brandului (logo-ul din header)
// Salveaza in public/logos/{slug}.svg|png|jpg|webp si genereaza un raport HTML
// (se deschide singur in browser) ca sa verifici fiecare logo.
//
// - Brandurile care au deja logo in public/logos/ sunt sarite.
//   Ca sa reiei un brand, sterge fisierul lui si ruleaza din nou.
// - Un logo gresit sau invizibil? Sterge fisierul din public/logos/ —
//   pe site va aparea numele brandului scris, ca pana acum.
// - Poti rula doar cateva branduri:  node descarca-logo-uri.mjs casio seiko ray-ban
// - Logo pus de mana: salvezi fisierul ca public/logos/{slug}.png (sau .svg);
//   slug-ul il vezi in raport sau in adresa paginii brandului (/ceasuri/brand/casio/).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Gaseste folderul site-ului (cel cu src/data/products.json)
function radacinaSite() {
  const start = [process.cwd(), path.dirname(fileURLToPath(import.meta.url))];
  for (const s of start) {
    let d = s;
    for (let i = 0; i < 4; i++) {
      if (fs.existsSync(path.join(d, 'src', 'data', 'products.json')) && fs.existsSync(path.join(d, 'src', 'data', 'clasificare.mjs'))) return d;
      d = path.dirname(d);
    }
  }
  console.error('\nNU gasesc src\\data\\products.json.');
  console.error('Pune descarca-logo-uri.mjs si descarca-logo-uri.bat direct in folderul shoes-site');
  console.error('(acolo unde sunt package.json si folderul src), apoi ruleaza din nou.\n');
  process.exit(1);
}
const RADACINA = radacinaSite();
process.chdir(RADACINA);
const { clasifica } = await import(pathToFileURL(path.join(RADACINA, 'src', 'data', 'clasificare.mjs')).href);
const { brandKey, slugify } = await import(pathToFileURL(path.join(RADACINA, 'src', 'data', 'text.mjs')).href);

// ── Brandurile afisate pe site (aceeasi regula ca in src/data/catalog.mjs) ──
const MIN_PRODUSE_BRAND = 5;
const MAX_BRANDURI_CATEGORIE = 24;
function branduriSite() {
  const date = JSON.parse(fs.readFileSync(path.join('src', 'data', 'products.json'), 'utf8'));
  const prod = [];
  for (const p of date) {
    if (p.draft || p.availability === false || !p.price || !p.affiliate_url) continue;
    const r = clasifica(p);
    if (r.exclus) continue;
    prod.push({ categorie: r.categorie, brand: p.brand, bkey: brandKey(p.brand) });
  }
  const nume = new Map();
  for (const p of prod) {
    if (!p.bkey) continue;
    const m = nume.get(p.bkey) || new Map();
    const n = String(p.brand).trim();
    m.set(n, (m.get(n) || 0) + 1);
    nume.set(p.bkey, m);
  }
  const info = new Map();
  for (const [k, m] of nume) {
    let best = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const mixt = [...m.keys()].find((x) => x !== x.toUpperCase());
    if (best === best.toUpperCase() && mixt) best = mixt;
    info.set(k, { name: best, slug: slugify(best) });
  }
  const pe = new Map(); // "categorie/slug" -> nr
  for (const p of prod) {
    const b = info.get(p.bkey);
    if (!b) continue;
    const k = `${p.categorie}/${b.slug}`;
    pe.set(k, (pe.get(k) || 0) + 1);
  }
  const numeSlug = new Map([...info.values()].map((b) => [b.slug, b.name]));
  const out = new Map();
  for (const cat of new Set(prod.map((p) => p.categorie))) {
    const lista = [...pe].filter(([k, n]) => k.startsWith(cat + '/') && n >= MIN_PRODUSE_BRAND)
      .sort((a, b) => b[1] - a[1]).slice(0, MAX_BRANDURI_CATEGORIE);
    for (const [k, n] of lista) {
      const slug = k.slice(cat.length + 1);
      const e = out.get(slug) || { slug, name: numeSlug.get(slug) || slug, n: 0 };
      e.n += n;
      out.set(slug, e);
    }
  }
  return [...out.values()].sort((a, b) => b.n - a.n);
}
const brands = branduriSite();

const OUT = path.resolve('public/logos');
const RAPORT = path.join(os.tmpdir(), 'logo-uri-raport-style.html'); // in afara repo-ului, ca sa nu ajunga in commit
const UA_WIKI = 'styleaccessories-logo-fetch/1.0 (https://styleaccessories.eu)';
const UA_WEB = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const EXT = ['svg', 'png', 'webp', 'jpg'];

// slug: [site oficial, nume pentru cautarea pe Wikidata (optional)]
// Site gol = nu se cauta (marca proprie / brand mic) — logo-ul se pune de mana sau ramane numele scris.
// Un brand care nu e in lista e cautat doar dupa nume pe Wikidata (marcat „verifică" in raport).
const SURSE = {
  // ceasuri
  'casio': ['casio.com', 'Casio'], 'citizen': ['citizenwatch.com', 'Citizen Watch'], 'q-q': ['qq-watch.jp'],
  'festina': ['festina.com', 'Festina'], 'versace': ['versace.com', 'Versace'], 'michael-kors': ['michaelkors.com', 'Michael Kors'],
  'bulova': ['bulova.com', 'Bulova'], 'seiko': ['seikowatches.com', 'Seiko'], 'radiant': [''], 'daniel-klein': [''],
  'bering': ['bering.com'], 'philipp-plein': ['plein.com', 'Philipp Plein'], 'lorus': ['lorus.com', 'Lorus'],
  'fossil': ['fossil.com', 'Fossil Group'], 'swiss-alpine-military': [''],
  'zeppelin': ['zeppelin-watches.com'], 'maserati': ['maserati.com', 'Maserati'], 'jacques-lemans': ['jacques-lemans.com', 'Jacques Lemans'],
  'emporio-armani': ['armani.com', 'Emporio Armani'], 'orient': ['orient-watch.com', 'Orient Watch'],
  'laura-biagiotti': ['laurabiagiotti.it', 'Laura Biagiotti'], 'tommy-hilfiger': ['tommy.com', 'Tommy Hilfiger'],
  'guess': ['guess.com', 'Guess'], 'police': ['policelifestyle.com'], 'time-force': [''],
  // bijuterii
  'pandora': ['pandora.net', 'Pandora'], 'folli-follie': ['follifollie.com', 'Folli Follie'], 'viceroy': ['viceroy.es'],
  'thomas-sabo': ['thomassabo.com', 'Thomas Sabo'], 'rosefield': ['rosefieldwatches.com'], 'ania-haie': ['aniahaie.com'],
  'paul-hewitt': ['paul-hewitt.com'], 'sif-jakobs': ['sifjakobs.com'], 'rinntin': ['rinntin.com'], 'lancaster': [''],
  'secrecy': [''], 'adore': [''], 'la-petite-story': [''], 'cristian-lay': [''], 'panarea': [''],
  'haifeng': [''], 'zhuhai': [''], 'amanda': [''],
  // ochelari / rame
  'polaroid': ['polaroideyewear.com', 'Polaroid'], 'italia-independent': ['italiaindependent.com', 'Italia Independent'],
  'web-eyewear': ['webeyewear.com'], 'ray-ban': ['ray-ban.com', 'Ray-Ban'], 'carrera': ['carreraworld.com'],
  'sting': [''], 'lozza': [''], 'tous': ['tous.com', 'Tous'], 'pucci': ['pucci.com', 'Emilio Pucci'],
  'converse': ['converse.com', 'Converse'], 'missoni': ['missoni.com', 'Missoni'], 'm-missoni': [''],
  'fila': ['fila.com', 'Fila'], 'jimmy-choo': ['jimmychoo.com', 'Jimmy Choo'], 'helly-hansen': ['hellyhansen.com', 'Helly Hansen'],
  'vuarnet': ['vuarnet.com', 'Vuarnet'], 'love-moschino': [''], 'dsquared2': ['dsquared2.com', 'Dsquared2'],
  'adidas': ['adidas.com', 'Adidas'], 'more-more': [''], 'armani': ['armani.com', 'Giorgio Armani'],
  'victoria-beckham': ['victoriabeckham.com'], 'hugo-boss': ['hugoboss.com', 'Hugo Boss'], 'nike': ['nike.com', 'Nike'],
  'oakley': ['oakley.com', 'Oakley'], 'tods': ['tods.com', "Tod's"], 'londonbe': [''], 'try-cover-change': [''],
  'moschino': ['moschino.com', 'Moschino'], 'bottega-veneta': ['bottegaveneta.com', 'Bottega Veneta'],
  'furla': ['furla.com', 'Furla'], 'pierre-cardin': ['pierrecardin.com', 'Pierre Cardin'], 'porsche': ['porsche-design.com', 'Porsche Design'],
  'loewe': ['loewe.com', 'Loewe'], 'alexander-mcqueen': ['alexandermcqueen.com', 'Alexander McQueen'],
  'ermenegildo-zegna': ['zegna.com', 'Zegna'], 'seventh-street': [''], 'just-cavalli': ['robertocavalli.com', 'Just Cavalli'],
  'levi-s': ['levi.com', 'Levi Strauss & Co.'],
  // incaltaminte / genti / haine
  'gryxx': ['gryxx.ro'], 'benvenuti': ['benvenuti.com'], 'otter': ['otter.ro'], 'picadili': ['picadili.ro'],
  'epica': ['epica.ro'], 'flavia-passini': [''], 'aldo': ['aldoshoes.com', 'Aldo Group'], 'jack-jones': ['jackjones.com', 'Jack & Jones'],
  's-oliver': ['soliver.com', 's.Oliver'], 'skechers': ['skechers.com', 'Skechers'], 'luca-di-gioia': [''], 'delis': [''],
  'enzo-bertini': [''], 'geox': ['geox.com', 'Geox'], 'bite-the-bullet': [''], 'rieker': ['rieker.com', 'Rieker'], 'image': [''],
  'premiata': ['premiata.it', 'Premiata'], 'clarks': ['clarks.com', 'Clarks'], 'le-colonel': [''], 'marquise': [''],
  'solitaire': [''], 'desigual': ['desigual.com', 'Desigual'], 'solo-donna': [''], 'steve-madden': ['stevemadden.com', 'Steve Madden'],
  'thezeus': [''], 'gant': ['gant.com', 'Gant'], 'call-it-spring': ['callitspring.com', 'Call It Spring'],
  'selection-kids': [''], 'valentino': ['valentino.com', 'Valentino'], 'oem': [''], 'jeep': ['jeep.com', 'Jeep'], 'ronno': [''],
  'emu': ['emuaustralia.com', 'EMU Australia'], 'pfy': [''], 'lost': [''], 'la-galere': [''], 'crocs': ['crocs.com', 'Crocs'],
  'remonte': ['remonte.com'], 'caterpillar': ['catfootwear.com', 'Caterpillar Inc.'], 'pepe-jeans': ['pepejeans.com', 'Pepe Jeans'],
  'alberto-guardiani': ['albertoguardiani.com'], 'gold-deer': [''], 'replay': ['replayjeans.com'],
  'new-balance': ['newbalance.com', 'New Balance'], 'john-richmond': ['johnrichmond.com'], 'hoka': ['hoka.com', 'Hoka'],
  'norway': [''], 'q-s-by-s-oliver': [''],
};
// Adresa directă a logo-ului, pentru brandurile la care căutarea automată nu merge
// (site-ul blochează scriptul sau logo-ul nu e în pagină). Poți adăuga oricând:
// click dreapta pe logo, pe site-ul brandului → „Copiază adresa imaginii" → o pui aici.
const LOGO_DIRECT = {
  'police': 'https://assets.policelifestyle.com/images/main-logo.svg',
};

// Sub-branduri care folosesc logo-ul brandului principal (se copiaza fisierul)
const ACELASI_LOGO = {
  'jack-jones-plus': 'jack-jones', 's-oliver-big-sizes': 's-oliver', 's-oliver-black-label': 's-oliver',
  'epica-premium': 'epica', 'boss': 'hugo-boss',
};

// ── utilitare ────────────────────────────────────────────────────────────
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const eticheta = (host) => { // "www.laroche-posay.ro" -> "larocheposay"
  const p = String(host || '').toLowerCase().replace(/^www\./, '').split('.');
  return norm(p.length > 2 && p[p.length - 2].length <= 3 ? p[p.length - 3] : p[0]);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, { ua = UA_WEB, tip = 'text', timeout = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': ua, 'Accept-Language': 'ro,en;q=0.8' }, redirect: 'follow', signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const body = tip === 'buf' ? Buffer.from(await r.arrayBuffer()) : tip === 'json' ? await r.json() : await r.text();
    return { body, ct, url: r.url };
  } finally { clearTimeout(t); }
}

function extensie(ct, url, buf) {
  const head = buf.subarray(0, 600).toString('utf8').toLowerCase();
  if (head.includes('<svg') && !head.includes('<html')) return 'svg';
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg';
  if (buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if (ct.includes('svg')) return 'svg';
  return null; // gif, ico, html etc. — nu le folosim
}

function salveaza(slug, buf, ext) {
  if (ext === 'svg') {
    let s = buf.toString('utf8');
    s = s.slice(s.indexOf('<svg'));                       // scoate <?xml>, doctype, comentarii de dinainte
    // entitatile din doctype (SVG-uri Illustrator) nu mai exista dupa ce scoatem doctype-ul
    s = s.replace(/&ns_svg;/g, 'http://www.w3.org/2000/svg').replace(/&ns_xlink;/g, 'http://www.w3.org/1999/xlink').replace(/&ns_[a-z_]+;/g, 'http://ns.adobe.com/x');
    // atribute duplicate in <svg ...> (ex. xmlns de doua ori) fac fisierul invalid -> nu se afiseaza
    const fin = s.indexOf('>');
    const vazute = new Set();
    const atr = [...s.slice(4, fin).matchAll(/([\w:.-]+)\s*=\s*("[^"]*"|'[^']*')/g)].filter((m) => !vazute.has(m[1]) && vazute.add(m[1])).map((m) => `${m[1]}=${m[2]}`);
    if (!vazute.has('xmlns')) atr.unshift('xmlns="http://www.w3.org/2000/svg"');
    s = '<svg ' + atr.join(' ') + (s.slice(0, fin).trimEnd().endsWith('/') ? '/' : '') + s.slice(fin);
    buf = Buffer.from(s);
  }
  const f = path.join(OUT, `${slug}.${ext}`);
  fs.writeFileSync(f, buf);
  return path.basename(f);
}

// ── sursa 1: Wikidata (proprietatea P154 = logo) ─────────────────────────
const RE_BRAND = /watch|jewel|eyewear|sunglass|shoe|footwear|clothing|apparel|bag|leather|marque|company|compan|manufactur|cosmetic|perfum|fragranc|fashion|luxury|maison|house|pharma|supplement|toothbrush|oral|dental|baby|diaper|nappy|condom|sex toy|tea|chocolate|medical|razor|shav|appliance|electronics|skin ?care|hair|retailer/i;

async function wikidata(nume, domeniu) {
  const s = await get(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&uselang=en&type=item&limit=8&search=${encodeURIComponent(nume)}`, { ua: UA_WIKI, tip: 'json' });
  const ids = (s.body.search || []).map((x) => x.id);
  if (!ids.length) return null;
  const e = await get(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims%7Cdescriptions%7Clabels&languages=en&ids=${ids.join('%7C')}`, { ua: UA_WIKI, tip: 'json' });
  const candidati = [];
  for (const id of ids) {
    const ent = e.body.entities?.[id];
    const logos = (ent?.claims?.P154 || []).filter((c) => c.mainsnak?.datavalue && !c.qualifiers?.P582); // fara logo-uri vechi (cu data de sfarsit)
    if (!logos.length) continue;
    const logo = (logos.find((c) => c.rank === 'preferred') || logos[0]).mainsnak.datavalue.value;
    const site = (ent.claims.P856 || []).map((c) => { try { return new URL(c.mainsnak.datavalue.value).hostname; } catch { return ''; } });
    const desc = ent.descriptions?.en?.value || '';
    const label = ent.labels?.en?.value || '';
    let incredere = 0;
    if (domeniu && site.some((h) => eticheta(h) === eticheta(domeniu))) incredere = 2;            // acelasi site oficial
    else if (norm(label) === norm(nume) && RE_BRAND.test(desc)) incredere = 1;                    // acelasi nume + descriere de brand
    if (incredere) candidati.push({ id, logo, desc, incredere });
  }
  candidati.sort((a, b) => b.incredere - a.incredere);
  return candidati[0] || null;
}

async function descarcaCommons(fisier) {
  const r = await get(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fisier.replace(/ /g, '_'))}`, { ua: UA_WIKI, tip: 'buf' });
  return r;
}

// ── sursa 2: site-ul oficial (logo-ul din header) ────────────────────────
const RE_RAU = /payment|visa|mastercard|paypal|footer|partner|award|flag|social|facebook|instagram|tiktok|youtube|twitter|pinterest|trustpilot|klarna|apple-pay|google-pay|anpc|sal\b|sol\b|gdpr|cookie|badge|app-?store|google-?play/i;

function atribute(tag) {
  const a = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) a[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  return a;
}

export function gasesteLogoInHtml(html, baza, numeBrand) {
  const brandN = norm(numeBrand);
  // a) <img> cu "logo" in src/class/id/alt
  const imgs = [];
  let poz = 0;
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const a = atribute(m[0]);
    let src = a['data-src'] || a['data-lazy-src'] || a.src || (a.srcset || a['data-srcset'] || '').split(',')[0].trim().split(/\s+/)[0];
    if (!src || src.startsWith('data:image/gif') || src.startsWith('data:')) continue;
    // contextul de dinainte (clasele parintilor, ex. <a class="header__logo">)
    const ctx = html.slice(Math.max(0, m.index - 300), m.index);
    const aproape = ctx.split('<').slice(-2).join('<'); // tagurile imediat dinainte (parintele direct)
    const txt = [src, a.class, a.id, a.alt, a.title].join(' ');
    let scor = 0;
    if (/logo/i.test(txt)) scor += 3;
    if (/logo/i.test(ctx)) scor += 2;
    if (brandN && norm(a.alt).includes(brandN)) scor += 2;
    if (/header|navbar|masthead|site-?brand/i.test(ctx)) scor += 1;
    if (RE_RAU.test(txt) || RE_RAU.test(aproape)) scor -= 6;
    scor -= poz++ * 0.05; // preferam primele imagini din pagina
    if (scor >= 3) { try { imgs.push({ url: new URL(src.replace(/&amp;/g, '&'), baza).href, scor, tip: 'img' }); } catch {} }
  }
  // b) <svg> inline intr-un element cu "logo"
  const svgs = [];
  for (const m of html.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)) {
    const ctx = html.slice(Math.max(0, m.index - 250), m.index);
    const tag = m[0].slice(0, 300);
    const aproape = ctx.split('<').slice(-2).join('<');
    if (!/logo/i.test(aproape + tag) || RE_RAU.test(aproape + tag)) continue;
    if (m[0].length < 400 || !/viewbox/i.test(tag)) continue;  // iconite mici / fara dimensiuni
    if (/<use\b/i.test(m[0]) && m[0].length < 800) continue;   // trimitere la un sprite extern, nu desenul in sine
    svgs.push({ svg: m[0], scor: 4 - svgs.length * 0.1, tip: 'svg' });
  }
  return [...imgs, ...svgs].sort((x, y) => y.scor - x.scor).slice(0, 4);
}

async function siteOficial(domeniu, numeBrand) {
  const pagina = await get(`https://${domeniu}/`, { timeout: 25000 });
  const cand = gasesteLogoInHtml(pagina.body, pagina.url, numeBrand);
  for (const c of cand) {
    try {
      if (c.tip === 'svg') {
        const buf = Buffer.from(c.svg);
        return { buf, ext: 'svg', sursa: `${domeniu} (svg din pagina)` };
      }
      const r = await get(c.url, { tip: 'buf' });
      const ext = extensie(r.ct, c.url, r.body);
      if (ext && r.body.length > (ext === 'svg' ? 80 : 300)) return { buf: r.body, ext, sursa: c.url };
    } catch {}
  }
  return null;
}

// ── rulare ───────────────────────────────────────────────────────────────
const exista = (slug) => EXT.find((e) => fs.existsSync(path.join(OUT, `${slug}.${e}`)));

async function proceseaza(b) {
  const [domeniu = '', numeWiki = ''] = SURSE[b.slug] || ['', b.name];
  const rez = { slug: b.slug, name: b.name, domeniu };
  const ext0 = exista(b.slug);
  if (ext0) return { ...rez, status: 'exista', fisier: `${b.slug}.${ext0}`, sursa: 'era deja in public/logos' };
  const parinte = ACELASI_LOGO[b.slug];
  if (parinte) {
    const extP = exista(parinte);
    if (!extP) return { ...rez, status: 'lipsa', motiv: `foloseste logo-ul ${parinte} — ruleaza din nou dupa ce ${parinte} are logo` };
    fs.copyFileSync(path.join(OUT, `${parinte}.${extP}`), path.join(OUT, `${b.slug}.${extP}`));
    return { ...rez, status: 'ok', fisier: `${b.slug}.${extP}`, sursa: `copiat de la ${parinte}`, verifica: false };
  }
  const erori = [];
  let wd = null;

  // 0. Adresa directă, dacă e trecută în LOGO_DIRECT
  if (LOGO_DIRECT[b.slug]) {
    try {
      const r = await get(LOGO_DIRECT[b.slug], { tip: 'buf' });
      const ext = extensie(r.ct, r.url, r.body);
      if (ext) return { ...rez, status: 'ok', fisier: salveaza(b.slug, r.body, ext), sursa: LOGO_DIRECT[b.slug], verifica: true };
      erori.push('adresa directa: nu e imagine');
    } catch (e) { erori.push('adresa directa: ' + e.message); }
  }

  // 1. Wikidata — doar cand avem un nume de cautare (brand cunoscut)
  if (numeWiki) {
    try {
      wd = await wikidata(numeWiki, domeniu);
      if (wd && wd.incredere === 2) {
        const r = await descarcaCommons(wd.logo);
        const ext = extensie(r.ct, r.url, r.body);
        if (ext) return { ...rez, status: 'ok', fisier: salveaza(b.slug, r.body, ext), sursa: `Wikimedia Commons: ${wd.logo}`, verifica: false };
      }
    } catch (e) { erori.push('wikidata: ' + e.message); }
  }
  // 2. Site-ul oficial
  if (domeniu) {
    try {
      const r = await siteOficial(domeniu, b.name);
      if (r) return { ...rez, status: 'ok', fisier: salveaza(b.slug, r.buf, r.ext), sursa: r.sursa, verifica: true };
      erori.push('site: nu am gasit logo in pagina');
    } catch (e) { erori.push('site: ' + e.message); }
  }
  // 3. Wikidata cu potrivire doar dupa nume
  if (wd && wd.incredere === 1) {
    try {
      const r = await descarcaCommons(wd.logo);
      const ext = extensie(r.ct, r.url, r.body);
      if (ext) return { ...rez, status: 'ok', fisier: salveaza(b.slug, r.body, ext), sursa: `Wikimedia Commons: ${wd.logo} (${wd.desc})`, verifica: true };
    } catch (e) { erori.push('commons: ' + e.message); }
  }
  if (!numeWiki && !domeniu) erori.push('fara sursa (brand mic) — adauga logo-ul manual');
  return { ...rez, status: 'lipsa', motiv: erori.join(' · ') };
}

function raport(rezultate) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const card = (r) => `
    <div class="c ${r.status}${r.verifica ? ' v' : ''}">
      <div class="tile">${r.fisier ? `<img src="${pathToFileURL(path.join(OUT, r.fisier)).href}?${Date.now()}" alt="">` : `<span>${esc(r.name)}</span>`}</div>
      <div class="dark">${r.fisier ? `<img src="${pathToFileURL(path.join(OUT, r.fisier)).href}?${Date.now()}" alt="">` : ''}</div>
      <b>${esc(r.name)}</b> <code>${esc(r.fisier || r.slug)}</code>
      <small>${r.status === 'lipsa' ? esc(r.motiv) : esc(r.sursa)}</small>
      ${r.verifica ? '<em>verifică</em>' : ''}
    </div>`;
  const ok = rezultate.filter((r) => r.status !== 'lipsa');
  const lipsa = rezultate.filter((r) => r.status === 'lipsa');
  const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Raport logo-uri</title>
<style>
body{font:14px system-ui,sans-serif;margin:24px;background:#f4f4f6;color:#222}
h1{font-size:22px}h2{margin-top:32px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.c{background:#fff;border:1px solid #ddd;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:4px}
.c.v{border-color:#e0a100}.c.lipsa{opacity:.75}
.tile{height:46px;border:1px solid #eee;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff}
.tile img{max-height:34px;max-width:85%}.tile span{font-weight:700;letter-spacing:.04em;font-size:12px}
.dark{height:30px;border-radius:6px;background:#333;display:flex;align-items:center;justify-content:center}
.dark img{max-height:22px;max-width:85%}
code{font-size:12px;color:#666}small{color:#777;word-break:break-all;font-size:11px}
em{color:#a87800;font-style:normal;font-weight:700;font-size:12px}
</style></head><body>
<h1>Logo-uri: ${ok.length} găsite, ${lipsa.length} lipsă</h1>
<p>Caseta albă arată logo-ul exact cum apare pe site. Caseta neagră te ajută să vezi logo-urile albe (invizibile pe alb).<br>
<b>Ce faci:</b> dacă un logo e greșit, tăiat, invizibil sau e altceva (bannere, iconițe), șterge fișierul lui din <code>public\\logos\\</code>. Cele marcate <em>verifică</em> au fost luate din pagina brandului sau găsite doar după nume — uită-te atent la ele.</p>
<h2>Găsite</h2><div class="g">${ok.map(card).join('')}</div>
<h2>Lipsă (${lipsa.length})</h2><div class="g">${lipsa.map(card).join('')}</div>
</body></html>`;
  fs.writeFileSync(RAPORT, html);
}

export async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const doar = process.argv.slice(2);
  // sub-brandurile (care copiaza logo-ul altui brand) la final, dupa ce parintele e gata
  const lista = brands.filter((b) => !doar.length || doar.includes(b.slug))
    .sort((a, b) => (ACELASI_LOGO[a.slug] ? 1 : 0) - (ACELASI_LOGO[b.slug] ? 1 : 0));
  const rezultate = new Array(lista.length);
  let i = 0, gata = 0;
  const nrNormale = lista.filter((b) => !ACELASI_LOGO[b.slug]).length;
  async function lucrator(pana = lista.length) {
    while (i < pana) {
      const k = i++;
      const b = lista[k];
      try { rezultate[k] = await proceseaza(b); }
      catch (e) { rezultate[k] = { slug: b.slug, name: b.name, status: 'lipsa', motiv: e.message }; }
      const r = rezultate[k];
      gata++;
      console.log(`[${String(gata).padStart(3)}/${lista.length}] ${r.status === 'lipsa' ? 'LIPSA ' : r.status === 'exista' ? 'EXISTA' : 'OK    '} ${b.slug}${r.status === 'lipsa' ? '  — ' + r.motiv : '  ← ' + r.sursa}`);
      await sleep(300);
    }
  }
  await Promise.all([lucrator(nrNormale), lucrator(nrNormale), lucrator(nrNormale), lucrator(nrNormale)]);
  await lucrator();
  raport(rezultate);
  const ok = rezultate.filter((r) => r.status !== 'lipsa').length;
  console.log(`\nGata: ${ok} logo-uri in public/logos, ${rezultate.length - ok} lipsa.`);
  console.log(`Raport: ${RAPORT}`);
  fs.writeFileSync(path.join(os.tmpdir(), 'logo-uri-raport.cale'), RAPORT);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
