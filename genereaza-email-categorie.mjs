// genereaza-email-categorie.mjs — email cu top 20 reduceri dintr-o categorie sau un tip
//
// Rulare:   node genereaza-email-categorie.mjs                 (îți arată lista și alegi numărul)
//           node genereaza-email-categorie.mjs ceasuri         (o categorie întreagă)
//           node genereaza-email-categorie.mjs ceasuri/dama    (un tip din categorie)
// Rezultat: email-categorie-output.html (+ -previzualizare.html)
import readline from 'node:readline';
import { incarcaProduse, scor, reducereReala, bannerZi, sectiune, email, scrieRezultat, utm, azi, SITE, CATEGORII, TIPURI, MAGAZINE } from './email-comun.mjs';

const TOP = 20;
const MAX_PE_BRAND = 3;

// Lista opțiunilor: fiecare categorie + tipurile ei (fără „alte-*")
const optiuni = [];
for (const c of CATEGORII) {
  optiuni.push({ cheie: c.slug, nume: c.label, cat: c.slug, tip: null, url: `/${c.slug}/` });
  for (const t of [...(TIPURI[c.slug] || []), ...(TIPURI[c.slug + 'Extra'] || [])]) {
    if (/^alte-/.test(t.slug)) continue;
    optiuni.push({ cheie: `${c.slug}/${t.slug}`, nume: `${c.label} › ${t.label}`, cat: c.slug, tip: t.slug, url: `/${c.slug}/tip/${t.slug}/` });
  }
}

async function alege() {
  const arg = process.argv[2];
  if (arg) return optiuni.find((o) => o.cheie === arg.toLowerCase());
  optiuni.forEach((o, i) => console.log(`${String(i + 1).padStart(3)}. ${o.tip ? '   ' : ''}${o.nume}`));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const r = await new Promise((res) => rl.question('\nNumărul sau numele (ex: ceasuri/dama): ', res));
  rl.close();
  const k = parseInt(r, 10);
  return !isNaN(k) ? optiuni[k - 1] : optiuni.find((o) => o.cheie === r.trim().toLowerCase());
}

const o = await alege();
if (!o) { console.error('❌ Opțiune negăsită.'); process.exit(1); }

const peBrand = {};
const lista = incarcaProduse()
  .filter((p) => reducereReala(p) && p.categorie === o.cat && (!o.tip || p.tip === o.tip || (p.tipuriExtra || []).includes(o.tip)))
  .sort((a, b) => scor(b) - scor(a))
  .filter((p) => { const b = (p.brand || '').toLowerCase(); peBrand[b] = (peBrand[b] || 0) + 1; return peBrand[b] <= MAX_PE_BRAND; })
  .slice(0, TOP);

if (!lista.length) { console.log(`⚠️  Niciun produs cu reducere în ${o.nume}.`); process.exit(0); }

// „Sneakers femei", „Ceasuri damă", „Genți & accesorii"
const SUFIX = { 'incaltaminte-femei': ' femei', 'incaltaminte-barbati': ' bărbați', 'incaltaminte-copii': ' copii' };
const nume = o.tip ? o.nume.split(' › ').pop() + (SUFIX[o.cat] || '') : o.nume;
const maxPct = Math.max(...lista.map((p) => p.pct));
const vedeta = lista.reduce((a, b) => (b.sum > a.sum ? b : a));
const branduri = [...new Set(lista.map((p) => p.brand).filter(Boolean))].slice(0, 3);
const L = (k) => k.toLocaleString('ro-RO');
const n = lista.length, de = n % 100 >= 1 && n % 100 <= 19 ? '' : 'de ';
const campanie = `categorie-${o.cheie.replace('/', '-')}-${azi().iso}`;

const subiecte = [
  `${nume}: până la -${maxPct}%. Ce alegi azi?`,
  `Top ${n} ${nume.toLowerCase()} cu reducere — ${branduri.join(', ')}`,
  `Cât ai da pe ${vedeta.brand || nume.toLowerCase()}? Azi, cu ${L(vedeta.sum)} lei mai puțin`,
];
const preheadere = [
  `${n} ${de}modele selectate după cea mai mare reducere reală, de la ${[...new Set(lista.map((p) => MAGAZINE[p.source_site]))].slice(0, 3).join(', ')}`,
  `Economisești până la ${L(vedeta.sum)} lei. Stocul e limitat.`,
  `Prețuri verificate azi — reducerile se schimbă zilnic`,
];

const html = email({
  titlu: `${nume} — reduceri de până la ${maxPct}%`,
  subtitlu: preheadere[0],
  banner: bannerZi(`${azi().iso}-${o.cheie}`),
  sectiuni: [sectiune(`🏷️ ${nume}`, lista, utm(SITE + o.url, campanie), `Vezi toate: ${nume.toLowerCase()} →`)],
  linkFinal: SITE + o.url,
  campanie,
});

scrieRezultat('email-categorie-output.html', { subiecte, preheadere, html, nota: `CATEGORIE: ${o.nume} · ${n} produse · ${azi().iso}` });
