// genereaza-redirecturi.mjs
// Construiește cele două site-uri de redirecționare pentru vechile adrese:
//   redirect-shop/   → shop.gherasimmarius.com  → styleaccessories.eu
//   redirect-style/  → style.gherasimmarius.com → styleaccessories.eu
//
// Rulare (după `npm run build`, ca să existe folderul dist/):
//   node genereaza-redirecturi.mjs <products.json vechi shop> <products.json vechi style>
//
// Fiecare adresă veche primește o pagină care trimite imediat la adresa nouă
// echivalentă (meta refresh 0 + canonical + JavaScript). Paginile vechi de
// paginare (/ceasuri/7) duc la aceeași pagină nouă dacă există, altfel la prima.
// Orice altă adresă necunoscută e prinsă de 404.html, care încearcă aceeași
// potrivire și, la nevoie, trimite la prima pagină.
import fs from 'node:fs';
import path from 'node:path';

const NOU = 'https://styleaccessories.eu';
const DIST = 'dist';
const [, , shopJson, styleJson] = process.argv;
if (!shopJson || !styleJson || !fs.existsSync(DIST)) {
  console.error('Folosire: node genereaza-redirecturi.mjs <shop products.json> <style products.json>  (după npm run build)');
  process.exit(1);
}

const exista = (p) => fs.existsSync(path.join(DIST, p, 'index.html'));
const PE_PAG = 24;

// ── Tabelele de corespondență vechi → nou ───────────────────────────────
const SHOP = {
  ceasuri: '/ceasuri/', 'ochelari-de-soare': '/ochelari-de-soare/', 'cadouri-pentru-el': '/cadouri-pentru-el/',
  'cadouri-pentru-ea': '/cadouri-pentru-ea/', noutati: '/noutati/', 'sub-150-lei': '/sub-150-lei/',
  oferte: '/oferte/', 'ofertele-saptamanii': '/ofertele-saptamanii/', cautare: '/cautare/',
  'gravura-personalizata': '/gravura-personalizata/', 'politica-de-confidentialitate': '/politica-de-confidentialitate/',
  'termeni-si-conditii': '/termeni-si-conditii/',
};
const IF = '/incaltaminte-femei/tip/', IB = '/incaltaminte-barbati/tip/', IM = '/imbracaminte/tip/', GA = '/genti-accesorii/tip/', BJ = '/bijuterii/tip/';
const STYLE = {
  femei: '/incaltaminte-femei/', barbati: '/incaltaminte-barbati/', copii: '/incaltaminte-copii/', bijuterii: '/bijuterii/',
  noutati: '/noutati/', oferte: '/oferte/', 'sub-300-lei': '/sub-300-lei/',
  confidentialitate: '/politica-de-confidentialitate/', termeni: '/termeni-si-conditii/',
  'sneakers-femei': IF + 'sneakers/', 'stiletto-femei': IF + 'pantofi-eleganti/', 'pantofi-cu-toc-femei': IF + 'pantofi-eleganti/',
  'pantofi-sport-femei': IF + 'pantofi-sport/', 'sandale-femei': IF + 'sandale/', 'ghete-femei': IF + 'ghete-botine/',
  'botine-femei': IF + 'ghete-botine/', 'cizme-femei': IF + 'cizme/', 'balerini-femei': IF + 'balerini/',
  'saboti-femei-crocs': IF + 'papuci-saboti/', 'saboti-femei': IF + 'papuci-saboti/', 'pantofi-femei': IF + 'pantofi-casual/',
  poseta: GA + 'posete-genti-dama/', 'portmoneu-femei': GA + 'portofele/', 'portmoneu-barbati': GA + 'portofele/',
  'curea-barbati': GA + 'curele/', 'geanta-crossbody': GA + 'genti-barbati/', 'accesorii-haine-barbati': GA + 'palarii-sepci/',
  'sneakers-barbati': IB + 'sneakers/', 'pantofi-sport-barbati': IB + 'pantofi-sport/', 'ghete-barbati': IB + 'ghete-bocanci/',
  'pantofi-derby-barbati': IB + 'pantofi-eleganti/', 'pantofi-oxford-barbati': IB + 'pantofi-eleganti/',
  'mocasini-barbati': IB + 'mocasini/', 'pantofi-barbati': IB + 'pantofi-casual/',
  'tricouri-barbati': IM + 'tricouri/', 'tricouri-polo-barbati': IM + 'tricouri/', 'camasi-barbati': IM + 'camasi/',
  'blugi-barbati': IM + 'blugi/', 'pantaloni-barbati': IM + 'pantaloni/', 'pantaloni-scurti-barbati': IM + 'pantaloni/',
  'pulovere-barbati': IM + 'pulovere-hanorace/', 'hanorace-barbati': IM + 'pulovere-hanorace/', 'bluze-barbati': IM + 'pulovere-hanorace/',
  'geci-barbati': IM + 'geci-paltoane/', 'paltoane-barbati': IM + 'geci-paltoane/', 'veste-barbati': IM + 'geci-paltoane/',
  'sacouri-barbati': IM + 'sacouri-costume/', 'lenjerie-barbati': IM + 'lenjerie-pijamale/', 'costume-baie-barbati': IM + 'costume-baie/',
  'cercei-argint': BJ + 'cercei/', 'bratari-argint': BJ + 'bratari/', 'lantisoare-argint': BJ + 'coliere-lanturi/', 'inele-argint': BJ + 'inele/',
};
// dacă un tip nu mai are pagină (prea puține produse), urcăm la categoria lui
const sigur = (p) => {
  if (exista(p)) return p;
  const m = p.match(/^\/[^/]+\//);
  return m && exista(m[0]) ? m[0] : '/';
};

// ── Câte pagini aveau vechile liste (ca să acoperim /ceasuri/2 … /ceasuri/N) ──
const pagini = (n) => Math.max(1, Math.ceil(n / PE_PAG));
const live = (p) => !p.draft && p.availability !== false && p.price != null;
const shopP = JSON.parse(fs.readFileSync(shopJson, 'utf8')).filter(live);
const styleP = JSON.parse(fs.readFileSync(styleJson, 'utf8')).filter(live);
const nrShop = (slug) =>
  slug === 'sub-150-lei' ? shopP.filter((p) => p.price <= 150).length
  : slug === 'noutati' ? shopP.filter((p) => (p.category || []).includes('modele-noi')).length
  : shopP.filter((p) => (p.category || []).includes(slug)).length;
const nrStyle = (slug) =>
  slug === 'oferte' ? styleP.filter((p) => p.old_price > p.price).length
  : slug === 'sub-300-lei' ? styleP.filter((p) => p.price < 300).length
  : Math.max(styleP.filter((p) => (p.category || []).includes(slug)).length, styleP.filter((p) => p.subcategory === slug).length);

// ── Pagina de redirecționare ────────────────────────────────────────────
const html = (tinta) => {
  const u = NOU + tinta;
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Ne-am mutat pe styleaccessories.eu</title>
<link rel="canonical" href="${u}"><meta http-equiv="refresh" content="0; url=${u}">
<script>location.replace(${JSON.stringify(u)}+location.search+location.hash)</script></head>
<body style="font-family:system-ui,sans-serif;padding:2rem"><p>Ne-am mutat. Pagina este acum la <a href="${u}">${u}</a>.</p></body></html>`;
};

function construieste(folder, domeniuVechi, tabel, nr, cuStilVechi) {
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  let n = 0;
  const scrie = (vechi, tinta) => {
    const dir = path.join(folder, vechi);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html(tinta));
    n++;
  };
  fs.writeFileSync(path.join(folder, 'index.html'), html('/'));
  fs.writeFileSync(path.join(folder, 'CNAME'), domeniuVechi + '\n');
  fs.writeFileSync(path.join(folder, '.nojekyll'), '');
  const harta = {};
  for (const [vechi, nou] of Object.entries(tabel)) {
    const baza = sigur(nou);
    harta[vechi] = baza;
    scrie(vechi, baza);
    const total = pagini(nr(vechi));
    // style folosea /femei/1 pentru prima pagină; shop folosea /ceasuri
    for (let p = cuStilVechi ? 1 : 2; p <= total; p++) {
      const t = p > 1 && exista(`${baza}${p}`) ? `${baza}${p}/` : baza;
      scrie(`${vechi}/${p}`, t);
    }
  }
  if (cuStilVechi) {
    // /oferte/{magazin}/{pagina} de pe style
    for (const m of ['benvenuti', 'gryxx', 'otter', 'picadili', 'menzo']) {
      scrie(`oferte/${m}`, '/oferte/');
      for (let p = 1; p <= 60; p++) scrie(`oferte/${m}/${p}`, '/oferte/');
    }
  }
  // 404.html: prinde orice altă adresă veche (aceeași hartă, în browser)
  fs.writeFileSync(path.join(folder, '404.html'), `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Ne-am mutat pe styleaccessories.eu</title>
<script>
var H=${JSON.stringify(harta)};var s=location.pathname.split('/').filter(Boolean);
var t=(s[0]&&H[s[0]])||'/';location.replace(${JSON.stringify(NOU)}+t+location.search);
</script></head><body style="font-family:system-ui,sans-serif;padding:2rem"><p>Ne-am mutat pe <a href="${NOU}/">styleaccessories.eu</a>.</p></body></html>`);
  fs.writeFileSync(path.join(folder, 'README.md'), `# ${domeniuVechi} → styleaccessories.eu\n\nSite static de redirecționare, generat cu genereaza-redirecturi.mjs din proiectul shoes-site.\nGitHub Pages: Settings → Pages → Deploy from a branch → main / (root). Custom domain: ${domeniuVechi}.\n`);
  console.log(`${folder}: ${n} pagini de redirecționare + index.html + 404.html`);
}

construieste('redirect-shop', 'shop.gherasimmarius.com', SHOP, nrShop, false);
construieste('redirect-style', 'style.gherasimmarius.com', STYLE, nrStyle, true);
