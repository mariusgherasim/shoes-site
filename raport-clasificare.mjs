// raport-clasificare.mjs — verifică regulile din src/data/clasificare.mjs
// Rulare: node raport-clasificare.mjs  → raport-clasificare.html + .json
import fs from 'fs';
import { clasifica, CATEGORII, TIPURI } from './src/data/clasificare.mjs';

const products = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
const active = products.filter((p) => !p.draft && p.availability !== false && p.price);

const stats = {};
const excluded = {};
const samplesExcl = {};
for (const c of CATEGORII) stats[c.slug] = { total: 0, oferte: 0, tipuri: {}, extra: {}, gen: {}, branduri: {}, surse: {}, mostre: {} };

let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

for (const p of active) {
  const r = clasifica(p);
  if (r.exclus) {
    excluded[r.exclus] = (excluded[r.exclus] || 0) + 1;
    (samplesExcl[r.exclus] ||= []).push(p.title);
    continue;
  }
  const s = stats[r.categorie];
  s.total++;
  if (p.old_price && p.old_price > p.price) s.oferte++;
  s.tipuri[r.tip] = (s.tipuri[r.tip] || 0) + 1;
  for (const e of r.tipuriExtra) s.extra[e] = (s.extra[e] || 0) + 1;
  s.gen[r.gen] = (s.gen[r.gen] || 0) + 1;
  const b = (p.brand || '—').trim();
  s.branduri[b] = (s.branduri[b] || 0) + 1;
  s.surse[p.source_site] = (s.surse[p.source_site] || 0) + 1;
  const m = (s.mostre[r.tip] ||= []);
  if (m.length < 6) m.push(p.title);
  else if (rnd() < 0.02) m[Math.floor(rnd() * 6)] = p.title;
}

const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const label = (cat, slug) => (TIPURI[cat] || []).concat(TIPURI[cat + 'Extra'] || []).find((t) => t.slug === slug)?.label || slug;
const GEN = { ea: 'Pentru ea', el: 'Pentru el', copii: 'Copii', unisex: 'Unisex' };
const fmt = (n) => n.toLocaleString('ro-RO');

const totalCat = Object.values(stats).reduce((a, s) => a + s.total, 0);
let html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Raport clasificare</title>
<style>
:root{--navy:#14213D;--brass:#B8863A;--bg:#F3EEE3;--ink:#1B1F27;--steel:#7C8698;--line:#D8DBE0}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Inter,system-ui,sans-serif}
header{background:var(--navy);color:#fff;padding:28px 16px}
header h1{margin:0;font:600 26px Georgia,serif}header h1 span{color:var(--brass)}
header p{margin:6px 0 0;color:#cfd5e2}
main{max-width:1100px;margin:0 auto;padding:16px}
.sum{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin:16px 0 28px}
.sum a{background:#fff;border:1px solid var(--line);border-radius:4px;padding:12px;text-decoration:none;color:inherit}
.sum b{display:block;font:600 22px Georgia,serif;color:var(--navy)}
.sum small{color:var(--steel)}
section{background:#fff;border:1px solid var(--line);border-radius:4px;padding:16px;margin-bottom:22px}
h2{margin:0 0 4px;font:600 21px Georgia,serif;color:var(--navy)}
.meta{color:var(--steel);font-size:13px;margin-bottom:12px}
table{border-collapse:collapse;width:100%;font-size:14px}
td,th{border-top:1px solid var(--line);padding:7px 6px;vertical-align:top;text-align:left}
th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--steel)}
td.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;width:70px}
td.m{color:#444;font-size:13px}
.pill{display:inline-block;background:var(--bg);border-radius:10px;padding:1px 8px;margin:2px 3px 2px 0;font-size:12.5px}
.pill b{color:var(--brass)}
.wrap{overflow-x:auto}
</style></head><body><header><h1>style<span>.</span>accessories — raport clasificare</h1>
<p>${fmt(totalCat)} produse active pe site · ${fmt(Object.values(excluded).reduce((a, b) => a + b, 0))} excluse · generat ${new Date().toLocaleString('ro-RO')}</p></header><main>
<div class="sum">${CATEGORII.map((c) => `<a href="#${c.slug}"><b>${fmt(stats[c.slug].total)}</b>${esc(c.label)}<br><small>${fmt(stats[c.slug].oferte)} cu reducere</small></a>`).join('')}</div>`;

for (const c of CATEGORII) {
  const s = stats[c.slug];
  const tipuri = Object.entries(s.tipuri).sort((a, b) => b[1] - a[1]);
  const top = Object.entries(s.branduri).sort((a, b) => b[1] - a[1]).slice(0, 12);
  html += `<section id="${c.slug}"><h2>${esc(c.label)} — ${fmt(s.total)}</h2>
<div class="meta">Surse: ${Object.entries(s.surse).map(([k, v]) => `${esc(k)} ${fmt(v)}`).join(' · ')}</div>
<div class="meta">Gen: ${Object.entries(s.gen).map(([k, v]) => `<span class="pill">${GEN[k] || k} <b>${fmt(v)}</b></span>`).join('')}
${Object.keys(s.extra).length ? '<br>Filtre suplimentare: ' + Object.entries(s.extra).map(([k, v]) => `<span class="pill">${esc(label(c.slug, k))} <b>${fmt(v)}</b></span>`).join('') : ''}</div>
<div class="meta">Top branduri: ${top.map(([k, v]) => `<span class="pill">${esc(k)} <b>${fmt(v)}</b></span>`).join('')}</div>
<div class="wrap"><table><tr><th>Tip</th><th>Produse</th><th>Exemple</th></tr>
${tipuri.map(([t, n]) => `<tr><td>${esc(label(c.slug, t))}</td><td class="n">${fmt(n)}</td><td class="m">${(s.mostre[t] || []).map(esc).join('<br>')}</td></tr>`).join('')}
</table></div></section>`;
}
html += `<section><h2>Excluse</h2><table>${Object.entries(excluded).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v)}</td><td class="m">${samplesExcl[k].slice(0, 5).map(esc).join('<br>')}</td></tr>`).join('')}</table></section></main></body></html>`;

fs.writeFileSync('raport-clasificare.html', html);
fs.writeFileSync('raport-clasificare.json', JSON.stringify({ stats, excluded }, null, 1));
console.log('Total pe site:', totalCat, '| excluse:', excluded);
for (const c of CATEGORII) console.log(c.slug.padEnd(22), stats[c.slug].total, JSON.stringify(Object.fromEntries(Object.entries(stats[c.slug].tipuri).sort((a, b) => b[1] - a[1]))));
