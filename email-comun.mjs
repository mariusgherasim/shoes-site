// email-comun.mjs — piese comune pentru emailurile styleaccessories.eu
// Folosit de genereaza-email.mjs (zilnic / joi) și genereaza-email-categorie.mjs.
// Clasificarea produselor e ACEEAȘI ca pe site (src/data/clasificare.mjs).
import fs from 'node:fs';
import { clasifica, CATEGORII, TIPURI } from './src/data/clasificare.mjs';

export const SITE = 'https://styleaccessories.eu';
export const LOGO = `${SITE}/brand/logo-email.png`;
// pagina „Scrie o recenzie” (trstp.lt/ZytFwyTNmk duce la pagina de cod TrustBox, nu la recenzii)
export const TRUSTPILOT = 'https://www.trustpilot.com/evaluate/styleaccessories.eu';
export const LIMITA_KB = 102; // Gmail taie emailurile mai mari (inclusiv linkul de dezabonare)

export const MAGAZINE = {
  'watchshop.ro': 'WatchShop.ro', 'ceasuri-shop.ro': 'Ceasuri-Shop.ro', 'benvenuti.com': 'Benvenuti',
  'otter.ro': 'Otter', 'gryxx.ro': 'Gryxx', 'picadili.ro': 'Picadili', 'menzo.ro': 'Menzo', 'dyfashion.ro': 'DyFashion',
};
export const numeCategorie = (slug) => CATEGORII.find((c) => c.slug === slug)?.label || slug;
export { CATEGORII, TIPURI };

// ── Produse: active, clasificate, cu scor de reducere ─────────────────────
export function incarcaProduse() {
  const raw = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
  const out = [];
  for (const p of raw) {
    if (p.draft || p.availability === false || !p.price || !p.affiliate_url || !p.image_url) continue;
    const r = clasifica(p);
    if (r.exclus) continue;
    const pct = p.old_price && p.old_price > p.price ? Math.round(100 - (p.price / p.old_price) * 100) : 0;
    out.push({ ...p, ...r, pct, sum: pct ? Math.round(p.old_price - p.price) : 0 });
  }
  return out;
}

// Scorul de pe site: 60% procent + 40% lei economisiți; reducerile peste 85% nu intră
export const scor = (p) => 0.6 * (p.pct / 100) + 0.4 * Math.min(p.sum, 1500) / 1500;
// …și măcar 25 de lei economisiți (fără șosete de 5 lei în email)
export const reducereReala = (p) => p.pct >= 10 && p.pct <= 85 && p.sum >= 25;

// ── Aleator determinist (aceeași selecție toată ziua) ─────────────────────
export function rng(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
}
export function amesteca(arr, seed) {
  const r = rng(seed), a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Data de azi și ziua săptămânii în ora României
export function azi() {
  const d = new Date();
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bucharest' }).format(d);
  const zi = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Bucharest', weekday: 'short' }).format(d);
  return { iso, zi: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[zi] };
}

// ── Bannere 2Performant pentru email ──────────────────────────────────────
export function bannerZi(seed) {
  let b = [];
  try { b = JSON.parse(fs.readFileSync('public/banners.json', 'utf8')); } catch { return null; }
  const today = azi().iso;
  const ok = b.filter((x) => (x.channels || []).includes('email') && x.width >= 300 && x.width / x.height >= 1.5 &&
    (!x.valid_from || x.valid_from <= today) && (!x.valid_until || x.valid_until >= today));
  if (!ok.length) return null;
  return ok[Math.floor(rng(seed)() * ok.length)];
}

// ── HTML ──────────────────────────────────────────────────────────────────
const C = { navy: '#14213D', ink: '#1B1F27', steel: '#7C8698', line: '#D8DBE0', brass: '#B8863A', rust: '#A8402F', bg: '#F3EEE3' };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';
const MONO = "'Courier New', Courier, monospace";
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const scurt = (s, n = 55) => (s && s.length > n ? s.slice(0, n).trim() + '…' : s || '');
const lei = (n) => Number(n).toFixed(2).replace('.', ',') + ' lei';

export const utm = (url, campanie) => `${url}${url.includes('?') ? '&' : '?'}utm_source=mailerlite&utm_medium=email&utm_campaign=${campanie}`;

function card(p) {
  const hot = p.pct > 30
    ? `<span style="font-size:14px;line-height:1;">🔥</span> <span style="font-family:${MONO};font-size:12px;font-weight:bold;color:#E8492C;vertical-align:middle;">HOT DEAL</span>`
    : '<span style="font-size:12px;color:transparent;">·</span>';
  return `<td width="50%" style="width:50%;padding:7px;vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid ${C.line};border-radius:3px;">
<tr><td style="padding:8px 10px 4px;">${hot}</td></tr>
<tr><td style="padding:0 10px;text-align:center;"><a href="${esc(p.affiliate_url)}" target="_blank"><img src="${esc(p.image_url)}" alt="${esc(scurt(p.title, 40))}" width="250" style="display:block;width:100%;max-width:250px;height:auto;margin:0 auto;border:0;"></a></td></tr>
<tr><td style="padding:10px 12px 12px;">
<div style="font-family:${MONO};font-size:11px;color:${C.steel};text-transform:uppercase;">${esc(scurt(p.brand, 28))}</div>
<div style="font-family:${SANS};font-size:13px;font-weight:bold;color:${C.ink};margin:4px 0 6px;line-height:1.3;">${esc(scurt(p.title))}</div>
<span style="display:inline-block;background:${C.rust};color:#fff;font-family:${MONO};font-size:11px;font-weight:bold;padding:3px 8px;border-radius:12px;">-${p.pct}%</span>
<span style="font-family:${SANS};font-size:11px;color:${C.rust};">&nbsp;economisești ${p.sum} lei</span>
<div style="font-family:${MONO};font-size:13px;border-top:1px dashed ${C.line};padding-top:8px;margin-top:8px;">
<span style="color:${C.steel};text-decoration:line-through;font-size:12px;">${lei(p.old_price)}</span>&nbsp;
<span style="background:${C.brass};color:#fff;font-weight:bold;padding:4px 8px;border-radius:3px;">${lei(p.price)}</span></div>
<a href="${esc(p.affiliate_url)}" target="_blank" style="display:block;text-align:center;background:${C.navy};color:#fff;font-family:${SANS};font-size:12px;font-weight:bold;text-decoration:none;padding:9px;border-radius:3px;margin-top:10px;">Vezi oferta →</a>
</td></tr></table></td>`;
}

export function sectiune(titlu, produse, link, textLink) {
  if (!produse.length) return '';
  const randuri = [];
  for (let i = 0; i < produse.length; i += 2) {
    const a = produse.slice(i, i + 2);
    randuri.push(`<tr>${a.map(card).join('')}${a.length === 1 ? '<td width="50%"></td>' : ''}</tr>`);
  }
  return `<tr><td colspan="2" style="padding:22px 8px 6px;text-align:center;"><h2 style="font-family:${SERIF};color:${C.navy};font-size:20px;margin:0;border-top:2px solid ${C.brass};padding-top:14px;">${titlu}</h2></td></tr>
${randuri.join('\n')}
${link ? `<tr><td colspan="2" style="padding:8px 8px 4px;text-align:center;"><a href="${link}" target="_blank" style="font-family:${SANS};font-size:13px;color:${C.navy};text-decoration:underline;">${textLink}</a></td></tr>` : ''}`;
}

export function email({ titlu, subtitlu, banner, sectiuni, linkFinal, campanie }) {
  const b = banner ? `<tr><td colspan="2" style="padding:14px 8px 4px;text-align:center;"><a href="${esc(banner.click_url)}" target="_blank" rel="nofollow noopener"><img src="${esc(banner.image_url)}" alt="Ofertă parteneră" width="584" style="display:block;width:100%;max-width:584px;height:auto;margin:0 auto;border:0;border-radius:4px;"></a></td></tr>` : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:${C.bg};">
<tr><td colspan="2" style="background:${C.navy};padding:22px 16px 18px;text-align:center;">
<a href="${utm(SITE + '/', campanie)}" target="_blank"><img src="${LOGO}" alt="style.accessories" width="240" style="display:inline-block;width:240px;height:auto;border:0;"></a>
<div style="font-family:${MONO};font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.6);margin-top:8px;text-transform:uppercase;">Ceasuri · Bijuterii · Încălțăminte · Genți</div></td></tr>
<tr><td colspan="2" style="background:#fff;padding:20px 18px 16px;text-align:center;border-bottom:1px solid ${C.line};">
<h1 style="font-family:${SERIF};color:${C.navy};font-size:22px;line-height:1.3;margin:0 0 8px;">${esc(titlu)}</h1>
<p style="font-family:${SANS};font-size:14px;color:#555;margin:0;line-height:1.5;">${esc(subtitlu)}</p></td></tr>
${b}
${sectiuni.join('\n')}
<tr><td colspan="2" style="padding:18px 8px 8px;text-align:center;"><a href="${utm(linkFinal, campanie)}" target="_blank" style="display:inline-block;background:${C.brass};color:#fff;font-family:${SANS};font-size:14px;font-weight:bold;text-decoration:none;padding:12px 26px;border-radius:3px;">Vezi toate ofertele pe styleaccessories.eu →</a></td></tr>
<tr><td colspan="2" style="padding:18px 16px 20px;text-align:center;border-top:1px solid ${C.line};">
<p style="font-family:${SANS};font-size:12px;color:#555;margin:0 0 6px;">Ți-a plăcut o ofertă? <a href="${TRUSTPILOT}" target="_blank" style="color:${C.navy};">Lasă-ne o recenzie pe Trustpilot ★</a></p>
<p style="font-family:${SANS};font-size:10px;color:#999;margin:0;line-height:1.5;">Linkurile sunt de afiliere: putem primi un comision, fără cost în plus pentru tine. Prețurile și stocul pot varia — prețul final e cel de pe site-ul magazinului.<br>Nu mai vrei aceste emailuri? <a href="{$unsubscribe}" style="color:#999;text-decoration:underline;">Dezabonează-te</a>.</p>
</td></tr></table>`;
}

// Scrie fișierul de lucru (subiecte + HTML) și o previzualizare pentru browser
export function scrieRezultat(fisier, { subiecte, preheadere, html, nota }) {
  const kb = Buffer.byteLength(html, 'utf8') / 1024;
  const text = `SUBIECT — alege una dintre variante (o copiezi în câmpul Subject din MailerLite):
${subiecte.map((s, i) => `  ${'ABC'[i]}: ${s}`).join('\n')}

PREHEADER — alege una (câmpul Preheader):
${preheadere.map((s, i) => `  ${'ABC'[i]}: ${s}`).join('\n')}

${nota}
Dimensiune HTML: ${kb.toFixed(1)} KB ${kb > LIMITA_KB - 7 ? '⚠️ PREA APROAPE DE LIMITA GMAIL (102 KB) — redu numărul de produse' : '(sub limita Gmail de 102 KB ✓)'}
Expeditor: Style Accessories <office@gherasimmarius.com> · Grup: STYLE
⏰ Adaugă blocul nativ „Countdown" DEASUPRA blocului Custom HTML.

========================================
COD HTML (copiază tot ce urmează în blocul Custom HTML din MailerLite):
========================================

${html}
`;
  fs.writeFileSync(fisier, text, 'utf8');
  const prev = fisier.replace(/\.html$/, '-previzualizare.html');
  fs.writeFileSync(prev, `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subiecte[0])}</title></head><body style="margin:0;padding:20px 0;background:#e9e6df;">${html}</body></html>`, 'utf8');
  console.log(`\n✅ ${fisier}  (deschide ${prev} în browser ca să vezi emailul)`);
  console.log(`📏 ${kb.toFixed(1)} KB`);
  subiecte.forEach((s, i) => console.log(`📧 ${'ABC'[i]}: ${s}`));
}
