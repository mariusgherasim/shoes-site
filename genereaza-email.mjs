// genereaza-email.mjs — emailul zilnic styleaccessories.eu (grupul STYLE din MailerLite)
//
// Rulare:   node genereaza-email.mjs            (recunoaște singur ziua)
//           node genereaza-email.mjs --zi=joi   (forțezi o zi, pentru test: luni…duminica)
// Rezultat: email-output.html  (3 subiecte + 3 preheadere + codul HTML pentru MailerLite)
//           email-output-previzualizare.html  (îl deschizi în browser ca să vezi emailul)
//
// Structură: 🎁 Pentru ea (10) + 🎁 Pentru el (10), doar reduceri reale (10–85%),
// amestec pe categorii, maximum 2 produse de la același brand pe secțiune.
// Tema zilei primește 4 din cele 10 locuri:
//   luni ceasuri · marți încălțăminte · miercuri bijuterii · JOI TOP REDUCERI (fără temă)
//   vineri genți & accesorii · sâmbătă îmbrăcăminte · duminică ochelari de soare
// Zilnic: selecție rotativă din topul fiecărei categorii (alta în fiecare zi).
// Joi: cele mai mari reduceri ale săptămânii (după scor), fără rotație.
import { incarcaProduse, scor, reducereReala, amesteca, azi, bannerZi, sectiune, email, scrieRezultat, utm, SITE, MAGAZINE, numeCategorie } from './email-comun.mjs';

const PE_SECTIUNE = 10;
const LOCURI_TEMA = 4;
const MAX_PE_BRAND = 2;
const TOP_PE_CATEGORIE = 40;

const ZILE = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
const TEME = { 1: 'ceasuri', 2: 'incaltaminte', 3: 'bijuterii', 4: null, 5: 'genti-accesorii', 6: 'imbracaminte', 0: 'ochelari-de-soare' };
const NUME_TEMA = { ceasuri: 'ceasurilor', incaltaminte: 'încălțămintei', bijuterii: 'bijuteriilor', 'genti-accesorii': 'genților și accesoriilor', imbracaminte: 'hainelor', 'ochelari-de-soare': 'ochelarilor de soare' };

const CATEGORII_GEN = {
  ea: ['incaltaminte-femei', 'ceasuri', 'bijuterii', 'genti-accesorii', 'ochelari-de-soare', 'imbracaminte'],
  el: ['incaltaminte-barbati', 'ceasuri', 'genti-accesorii', 'ochelari-de-soare', 'imbracaminte', 'bijuterii'],
};
const temaPentru = (tema, gen) => (tema === 'incaltaminte' ? (gen === 'ea' ? 'incaltaminte-femei' : 'incaltaminte-barbati') : tema);

// ── Ziua ───────────────────────────────────────────────────────────────────
const { iso } = azi();
let zi = azi().zi;
const arg = process.argv.find((a) => a.startsWith('--zi='));
if (arg) zi = ZILE.indexOf(arg.slice(5).toLowerCase().replace('ț', 't').replace('ă', 'a'));
if (zi < 0) { console.error('Zi necunoscută. Folosește: luni, marti, miercuri, joi, vineri, sambata, duminica'); process.exit(1); }
const ESTE_JOI = zi === 4;
const tema = TEME[zi];
const seed = `${iso}-${zi}`;

// ── Selecția ───────────────────────────────────────────────────────────────
// joi intră doar Hot Deals (reducere de minimum 30%)
const toate = incarcaProduse().filter((p) => reducereReala(p) && (!ESTE_JOI || p.pct >= 30));

function selecteaza(gen) {
  const categorii = CATEGORII_GEN[gen];
  const cozi = {};
  for (const c of categorii) {
    let lista = toate.filter((p) => p.categorie === c && p.gen === gen).sort((a, b) => scor(b) - scor(a)).slice(0, TOP_PE_CATEGORIE);
    if (!ESTE_JOI) lista = amesteca(lista, `${seed}-${gen}-${c}`);
    cozi[c] = lista;
  }
  const ales = [], peBrand = {};
  const ia = (c) => {
    const q = cozi[c] || [];
    while (q.length) {
      const p = q.shift();
      const b = (p.brand || '').toLowerCase();
      if ((peBrand[b] || 0) >= MAX_PE_BRAND) continue;
      peBrand[b] = (peBrand[b] || 0) + 1;
      ales.push(p);
      return true;
    }
    return false;
  };
  const t = tema && temaPentru(tema, gen);
  if (t && cozi[t]) for (let i = 0; i < LOCURI_TEMA; i++) ia(t);
  const ordine = ESTE_JOI ? categorii : amesteca(categorii.filter((c) => c !== t), `${seed}-${gen}-ordine`);
  let gol = 0;
  while (ales.length < PE_SECTIUNE && gol < ordine.length) {
    gol = 0;
    for (const c of ordine) {
      if (ales.length >= PE_SECTIUNE) break;
      if (!ia(c)) gol++;
    }
  }
  // tema primele, apoi restul după scor (joi) sau în ordinea amestecată
  return ESTE_JOI ? ales.sort((a, b) => scor(b) - scor(a)) : ales;
}

const ea = selecteaza('ea');
const el = selecteaza('el');
const toateAlese = [...ea, ...el];
if (!toateAlese.length) { console.log('Nu există produse cu reducere. Nimic de generat.'); process.exit(0); }

// ── Subiecte și preheadere (cifre concrete + întrebări retorice) ───────────
const n = toateAlese.length;
const maxPct = Math.max(...toateAlese.map((p) => p.pct));
const minPct = Math.min(...toateAlese.map((p) => p.pct));
const vedetaPct = toateAlese.find((p) => p.pct === maxPct);
const vedetaLei = toateAlese.reduce((a, b) => (b.sum > a.sum ? b : a));
const magazine = [...new Set(toateAlese.map((p) => MAGAZINE[p.source_site] || p.source_site))];
const nrCat = (slug) => toateAlese.filter((p) => p.categorie.startsWith(slug)).length;
// „20 de reduceri" / „12 reduceri" (în română, 1–19 fără „de"); „4.303 lei"
const de = (k, cuv) => `${k.toLocaleString('ro-RO')} ${k % 100 >= 1 && k % 100 <= 19 ? '' : 'de '}${cuv}`;
const L = (k) => k.toLocaleString('ro-RO');
const scurt = (s, k = 28) => (s.length > k ? s.slice(0, k).trim() + '…' : s);
const brandScurt = (p) => scurt(p.brand || 'acest model', 22);

let subiecte, preheadere, titlu, campanie;
if (ESTE_JOI) {
  campanie = `joi-top-${iso}`;
  subiecte = [
    `🏆 Top reduceri ale săptămânii: de la -${minPct}% la -${maxPct}%`,
    `Cele mai mari ${de(n, 'reduceri')} ale săptămânii. Mai aștepți până duminică?`,
    `Joi = top reduceri. Până la ${L(vedetaLei.sum)} lei economie la un singur produs`,
  ];
  titlu = `Top reduceri ale săptămânii — de la -${minPct}% la -${maxPct}%`;
} else {
  campanie = `zilnic-${iso}`;
  const temaNume = NUME_TEMA[tema];
  const maxTema = Math.max(0, ...toateAlese.filter((p) => p.categorie.startsWith(tema)).map((p) => p.pct));
  subiecte = [
    `Ziua ${temaNume}: până la -${maxTema}%. Ce alegi azi?`,
    `-${maxPct}% la ${brandScurt(vedetaPct)}? ${de(n, 'reduceri')} pentru ea și el, doar azi`,
    `Cât ai da pe ${brandScurt(vedetaLei)}? Azi, cu ${L(vedetaLei.sum)} lei mai puțin`,
  ];
  titlu = `Ziua ${temaNume}: ${de(n, 'reduceri')} pentru ea și pentru el`;
}
const bucati = [
  nrCat('ceasuri') && `${nrCat('ceasuri')} ceasuri`,
  nrCat('incaltaminte') && `${nrCat('incaltaminte')} perechi de încălțăminte`,
  nrCat('bijuterii') && `${nrCat('bijuterii')} bijuterii`,
  nrCat('genti') && `${nrCat('genti')} genți și accesorii`,
].filter(Boolean).slice(0, 3).join(', ');
preheadere = [
  `${bucati} — reduceri reale, stoc limitat`,
  `Pentru ea și pentru el: ${de(n, 'produse')} de la ${magazine.slice(0, 3).join(', ')}${magazine.length > 3 ? ' și alții' : ''}`,
  `Economisești până la ${L(vedetaLei.sum)} lei azi. Mâine selecția se schimbă.`,
];

// ── HTML ────────────────────────────────────────────────────────────────────
const html = email({
  titlu,
  subtitlu: preheadere[0],
  banner: bannerZi(`${iso}-email`),
  sectiuni: [
    sectiune(ESTE_JOI ? '🏆 Top reduceri — Pentru ea' : '🎁 Pentru ea', ea, utm(`${SITE}/cadouri-pentru-ea/`, campanie), 'Toate ofertele pentru ea →'),
    sectiune(ESTE_JOI ? '🏆 Top reduceri — Pentru el' : '🎁 Pentru el', el, utm(`${SITE}/cadouri-pentru-el/`, campanie), 'Toate ofertele pentru el →'),
  ],
  linkFinal: `${SITE}/oferte/`,
  campanie,
});

const desc = (lista) => Object.entries(lista.reduce((m, p) => ((m[numeCategorie(p.categorie)] = (m[numeCategorie(p.categorie)] || 0) + 1), m), {})).map(([k, v]) => `${k} ${v}`).join(', ');
scrieRezultat('email-output.html', {
  subiecte, preheadere, html,
  nota: `${ESTE_JOI ? 'JOI — TOP REDUCERI' : `${ZILE[zi].toUpperCase()} — tema: ${numeCategorie(temaPentru(tema, 'ea'))}`} · ${iso}
Pentru ea (${ea.length}): ${desc(ea)}
Pentru el (${el.length}): ${desc(el)}`,
});
