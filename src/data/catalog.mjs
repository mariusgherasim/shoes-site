// ============================================================
// CATALOG — punctul unic prin care paginile citesc produsele.
// Se calculează o singură dată, la build:
//   1. produsele active din products.json
//   2. categoria, tipul și genul fiecăruia (reguli în clasificare.mjs)
//   3. brandurile principale ale fiecărei categorii (calculate automat)
//   4. colecțiile: oferte, Hot Deals, cadouri, sub 150 / 300 lei, noutăți
// products.json nu se modifică aici.
// ============================================================

import productsData from './products.json';
import { clasifica, TIPURI } from './clasificare.mjs';
import { categorii } from './categorii.js';
import { brandKey, slugify, niceCount } from './text.mjs';

export const MIN_PRODUSE_TIP = 5;
export const MIN_PRODUSE_BRAND = 5;
export const MAX_BRANDURI_CATEGORIE = 24;

// Tipurile „de rest" (ex. „Alte modele") nu apar ca tip separat în meniu/căutare
const ASCUNSE = /^alte-/;

const t0 = Date.now();

// ── 1. Produse active + clasificare ─────────────────────────────────────
export const produse = [];
export const excluse = {};
for (const p of productsData) {
  if (p.draft || p.availability === false || !p.price || !p.affiliate_url) continue;
  const r = clasifica(p);
  if (r.exclus) { excluse[r.exclus] = (excluse[r.exclus] || 0) + 1; continue; }
  const reducere = p.old_price && p.old_price > p.price ? Math.round(100 - (p.price / p.old_price) * 100) : null;
  produse.push({
    ...p,
    uid: `${p.source_site}:${p.id}`,
    old_price: reducere ? p.old_price : null,
    discount_percent: reducere,
    categorie: r.categorie,
    tip: r.tip,
    tipuri: [r.tip, ...r.tipuriExtra].filter(Boolean),
    gen: r.gen,
    bkey: brandKey(p.brand),
  });
}

// Ordinea implicită în liste: întâi produsele cu reducere, după un scor
// (60% procentul reducerii + 40% suma economisită în lei), apoi restul.
// Reducerile peste 85% (de obicei preț vechi umflat în feed) trec la final.
const scorOrdine = (p) => {
  const r = p.discount_percent || 0;
  if (!r) return 0;
  if (r > 85) return 0.001;
  return 0.6 * (r / 100) + 0.4 * Math.min(p.old_price - p.price, 1500) / 1500;
};
const ordine = (a, b) => scorOrdine(b) - scorOrdine(a);

// ── 2. Branduri: nume afișat + slug, din forma cea mai frecventă ────────
const numeBrand = new Map(); // bkey -> Map(nume original -> nr)
for (const p of produse) {
  if (!p.bkey) continue;
  const m = numeBrand.get(p.bkey) || new Map();
  const n = String(p.brand).trim();
  m.set(n, (m.get(n) || 0) + 1);
  numeBrand.set(p.bkey, m);
}
const brandInfo = new Map();
for (const [k, m] of numeBrand) {
  let best = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
  // „PANDORA" -> „Pandora" doar dacă există și o formă cu litere mici
  const mixt = [...m.keys()].find((x) => x !== x.toUpperCase());
  if (best === best.toUpperCase() && mixt) best = mixt;
  brandInfo.set(k, { name: best, slug: slugify(best) });
}
for (const p of produse) {
  const b = brandInfo.get(p.bkey);
  p.brandSlug = b ? b.slug : '';
  p.brandName = b ? b.name : '';
}

// ── 3. Indexuri ─────────────────────────────────────────────────────────
const byCat = new Map(categorii.map((c) => [c.slug, []]));
const byTip = new Map();
const byBrand = new Map();
for (const p of produse) {
  byCat.get(p.categorie)?.push(p);
  for (const t of p.tipuri) {
    const k = `${p.categorie}/${t}`;
    if (!byTip.has(k)) byTip.set(k, []);
    byTip.get(k).push(p);
  }
  if (p.brandSlug) {
    const k = `${p.categorie}/${p.brandSlug}`;
    if (!byBrand.has(k)) byBrand.set(k, []);
    byBrand.get(k).push(p);
  }
}
for (const m of [byCat, byTip, byBrand]) for (const list of m.values()) list.sort(ordine);

export const produseCategorie = (cat) => byCat.get(cat) || [];
export const produseTip = (cat, tip) => byTip.get(`${cat}/${tip}`) || [];
export const produseBrand = (cat, brand) => byBrand.get(`${cat}/${brand}`) || [];

// Tipurile afișate (minimum MIN_PRODUSE_TIP produse), în ordinea din clasificare.mjs
export function tipuriCategorie(cat) {
  const defs = [...(TIPURI[cat] || []), ...(TIPURI[cat + 'Extra'] || [])];
  return defs
    .filter((t) => !ASCUNSE.test(t.slug))
    .map((t) => ({ slug: t.slug, name: t.label, count: produseTip(cat, t.slug).length }))
    .filter((t) => t.count >= MIN_PRODUSE_TIP);
}

// Brandurile principale ale categoriei, după numărul de produse
export function brandsCategorie(cat) {
  const out = [];
  for (const [k, list] of byBrand) {
    const [c, slug] = k.split('/');
    if (c !== cat || list.length < MIN_PRODUSE_BRAND) continue;
    out.push({ slug, name: list[0].brandName, count: list.length });
  }
  return out.sort((a, b) => b.count - a.count).slice(0, MAX_BRANDURI_CATEGORIE);
}

// ── 4. Colecții ─────────────────────────────────────────────────────────
const CADOURI_DIN = new Set(['ceasuri', 'ochelari-de-soare', 'bijuterii', 'genti-accesorii']);
const COLECTII = {
  'ofertele-saptamanii': (p) => p.featured === true || (p.discount_percent || 0) > 30,
  'cadouri-pentru-ea': (p) => CADOURI_DIN.has(p.categorie) && p.gen === 'ea',
  'cadouri-pentru-el': (p) => CADOURI_DIN.has(p.categorie) && p.gen === 'el',
  noutati: (p) => (p.category || []).some((c) => c === 'modele-noi' || c === 'noutati'),
  'sub-150-lei': (p) => p.price <= 150,
  'sub-300-lei': (p) => p.price <= 300,
};
const byCol = new Map();
for (const [slug, f] of Object.entries(COLECTII)) byCol.set(slug, produse.filter(f).sort(ordine));
export const produseColectie = (slug) => byCol.get(slug) || [];

export const oferte = produse.filter((p) => p.discount_percent).sort(ordine);

// Cea mai mare reducere pentru titluri („până la -X%"). Ignorăm valorile peste 85%,
// care sunt de obicei prețuri vechi umflate în feed, nu reduceri reale.
export const maxReducere = () => oferte.reduce((m, p) => (p.discount_percent <= 85 ? Math.max(m, p.discount_percent) : m), 0);

// Câte un produs din fiecare categorie pe rând — ca listele de pe prima pagină
// să nu fie doar ceasuri (care sunt jumătate din catalog)
export function amestecaPeCategorii(list, n) {
  const pe = new Map();
  for (const p of list) {
    if (!p.image_url) continue;
    if (!pe.has(p.categorie)) pe.set(p.categorie, []);
    pe.get(p.categorie).push(p);
  }
  const cozi = [...pe.values()];
  const out = [];
  for (let i = 0; out.length < n && cozi.some((q) => q.length > i); i++) {
    for (const q of cozi) if (q[i] && out.length < n) out.push(q[i]);
  }
  return out;
}

// Hot Deals pentru prima pagină: scor 60% procent + 40% suma economisită,
// fără reducerile suspecte de peste 85%
export function hotDealsPrimaPagina(n = 12) {
  const scor = (p) => 0.6 * (p.discount_percent / 100) + 0.4 * Math.min(p.old_price - p.price, 1500) / 1500;
  const list = produseColectie('ofertele-saptamanii').filter((p) => p.discount_percent <= 85).sort((a, b) => scor(b) - scor(a));
  return amestecaPeCategorii(list, n);
}

// Recomandările curente: selecție care se schimbă zilnic (la fiecare build)
function rng(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
}
export function recomandate(n = 12) {
  const zi = new Date().toISOString().slice(0, 10);
  const r = rng(zi);
  const pool = produse.filter((p) => p.image_url && (p.recomandat === true || !p.discount_percent));
  const amestecat = pool.map((p) => [r(), p]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  return amestecaPeCategorii(amestecat, n);
}

// „peste 13.000 de produse" / „28 de produse" / „12 produse"
export function cuNumar(text, n) {
  const nr = niceCount(n);
  const afisat = Number(nr.replace(/\D/g, ''));
  const faraDe = afisat % 100 >= 1 && afisat % 100 <= 19;
  return String(text || '').replace(/\{N\}( de )?/g, (m, de, offset, all) => {
    const inainte = all.slice(0, offset).trimEnd();
    const start = inainte === '' || /[.?!]$/.test(inainte);
    const v = start ? nr.charAt(0).toUpperCase() + nr.slice(1) : nr;
    return de ? (faraDe ? `${v} ` : `${v} de `) : v;
  });
}

export const categoriiCuOferte = () => categorii.filter((c) => produseCategorie(c.slug).some((p) => p.discount_percent));

console.log(`[catalog] ${produse.length} produse active în ${Date.now() - t0} ms · excluse: ${JSON.stringify(excluse)}`);
