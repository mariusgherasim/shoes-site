// CLASIFICARE — punctul unic care decide în ce categorie, tip și gen intră
// fiecare produs pe styleaccessories.eu.
//
// products.json rămâne așa cum îl scriu scripturile de sincronizare.
// Reclasificarea se face doar aici, la build — regulile se pot schimba
// oricând, fără să rulezi din nou sincronizarea (același model ca la beauty).
//
// Semnale folosite, în ordinea încrederii:
//   1. URL-ul oficial (watchshop.ro are categoria în cale: /ceasuri-de-dama/...)
//   2. subcategory_raw (Picadili: "Cercei argint dama", "Oja semipermanenta"...)
//   3. subcategory / category din sincronizarea style (Otter, Menzo, Gryxx)
//   4. Cuvinte din titlu

export function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[șş]/g, 's').replace(/[țţ]/g, 't')
    .replace(/\s+/g, ' ')
    .trim();
}

const has = (text, rx) => rx.test(text);

// ── CATEGORII (ordinea = ordinea din meniu) ─────────────────────────────
export const CATEGORII = [
  { slug: 'ceasuri',              label: 'Ceasuri' },
  { slug: 'ochelari-de-soare',    label: 'Ochelari de soare' },
  { slug: 'rame-ochelari',        label: 'Rame de vedere' },
  { slug: 'bijuterii',            label: 'Bijuterii' },
  { slug: 'incaltaminte-femei',   label: 'Încălțăminte femei' },
  { slug: 'incaltaminte-barbati', label: 'Încălțăminte bărbați' },
  { slug: 'incaltaminte-copii',   label: 'Încălțăminte copii' },
  { slug: 'imbracaminte',         label: 'Îmbrăcăminte' },
  { slug: 'genti-accesorii',      label: 'Genți & accesorii' },
];

// ── TIPURI pe categorie — primul match câștigă pentru tipul principal,
//    dar un produs poate avea și tipuri "transversale" (gen, mecanism) ──
// rx se aplică pe textul normalizat: titlu + subcategorie brută + cale URL
export const TIPURI = {
  ceasuri: [
    { slug: 'smartwatch',        label: 'Smartwatch',            rx: /smart ?watch|smartwatches|\bcolmi\b|inel inteligent|smart ring|bratara fitness/ },
    { slug: 'accesorii-ceasuri', label: 'Curele & accesorii',    rx: /curele-si-bratari-ceasuri|cutii-ceasuri|curea ceas|curele ceas|cutie (pentru )?ceas/ },
    { slug: 'de-perete-birou',   label: 'De perete & birou',     rx: /ceasuri-de-perete|ceasuri-de-birou|ceas de perete|ceas de birou|desteptator/ },
    { slug: 'copii',             label: 'Ceasuri copii',         rx: /ceasuri-pentru-copii|ceasuri copii|ceas copii|pentru copii|\bbaieti\b|\bfete\b/ },
    { slug: 'barbatesti',        label: 'Ceasuri bărbătești',    rx: /ceasuri-barbatesti|barbatesc|barbati|\bmen\b|pentru el/ },
    { slug: 'dama',              label: 'Ceasuri damă',          rx: /ceasuri-de-dama|\bdama\b|femei|\bwomen\b|\blady\b|pentru ea/ },
    { slug: 'de-buzunar',        label: 'Ceasuri de buzunar',    rx: /buzunar/ },
    { slug: 'alte-modele',       label: 'Alte modele',           rx: /./ },
  ],
  // tipuri suplimentare (nu exclusive) pentru ceasuri
  ceasuriExtra: [
    { slug: 'automatice',        label: 'Automatice & mecanice', rx: /automatic|automat\b|mecanic|mechanical/ },
    { slug: 'digitale',          label: 'Digitale',              rx: /digital/ },
    { slug: 'cronograf',         label: 'Cronograf',             rx: /cronograf|chronograph/ },
  ],
  'ochelari-de-soare': [
    { slug: 'copii',      label: 'Ochelari copii',      rx: /ochelari-de-soare-copii|copii|\bkids?\b|junior/ },
    { slug: 'barbati',    label: 'Ochelari bărbați',    rx: /ochelari-de-soare-barbati|barbati|barbatesti|\bmen\b/ },
    { slug: 'dama',       label: 'Ochelari damă',       rx: /ochelari-de-soare-dama|\bdama\b|femei|\bwomen\b/ },
    { slug: 'unisex',     label: 'Unisex',              rx: /./ },
  ],
  'ochelari-de-soareExtra': [
    { slug: 'polarizati', label: 'Polarizați',          rx: /polariz/ },
  ],
  'rame-ochelari': [
    { slug: 'copii',   label: 'Rame copii',   rx: /rame-ochelari-de-vedere-copii|copii|\bkids?\b/ },
    { slug: 'barbati', label: 'Rame bărbați', rx: /rame-ochelari-de-vedere-barbati|barbati/ },
    { slug: 'dama',    label: 'Rame damă',    rx: /rame-ochelari-de-vedere-dama|\bdama\b|femei/ },
    { slug: 'unisex',  label: 'Unisex',       rx: /./ },
  ],
  bijuterii: [
    { slug: 'cercei',           label: 'Cercei',               rx: /cercei|cercel/ },
    { slug: 'inele',            label: 'Inele',                rx: /\binel/ },
    { slug: 'butoni',           label: 'Butoni',               rx: /butoni/ },
    { slug: 'brelocuri',        label: 'Brelocuri',            rx: /breloc/ },
    { slug: 'pandantive-charmuri', label: 'Pandantive & charmuri', rx: /pandantiv|charm|talisman/ },
    { slug: 'coliere-lanturi',  label: 'Coliere & lanțuri',    rx: /colier|lant|lantisor|lanturi/ },
    { slug: 'bratari',          label: 'Brățări',              rx: /bratar|glezna/ },
    { slug: 'seturi',           label: 'Seturi',               rx: /\bset\b|seturi/ },
    { slug: 'pandora',          label: 'Pandora',              rx: /pandora/ },
    { slug: 'alte-bijuterii',   label: 'Alte bijuterii',       rx: /./ },
  ],
  bijuteriiExtra: [
    { slug: 'argint',  label: 'Argint',  rx: /argint|silver|\b925\b/ },
  ],
  'incaltaminte-femei': [
    { slug: 'sneakers',          label: 'Sneakers',            rx: /sneaker/ },
    { slug: 'pantofi-sport',     label: 'Pantofi sport',       rx: /pantofi sport|sport|running|alergare|trail|tenisi/ },
    { slug: 'pantofi-eleganti',  label: 'Pantofi eleganți & cu toc', rx: /stiletto|stilet|cu toc|toc inalt|eleganti|elegant|pumps|decupat|platforma/ },
    { slug: 'ghete-botine',      label: 'Ghete & botine',      rx: /ghete|gheata|botine|botina|bocanci/ },
    { slug: 'cizme',             label: 'Cizme',               rx: /cizme|cizma/ },
    { slug: 'sandale',           label: 'Sandale',             rx: /sandal/ },
    { slug: 'papuci-saboti',     label: 'Papuci & saboți',     rx: /papuci|saboti|sabot|slapi|crocs|clog|ciocate|mule|\bsan\b/ },
    { slug: 'balerini',          label: 'Balerini',            rx: /balerin/ },
    { slug: 'mocasini',          label: 'Mocasini & loafers',  rx: /mocasin|loafer/ },
    { slug: 'espadrile',         label: 'Espadrile',           rx: /espadril/ },
    { slug: 'pantofi-casual',    label: 'Pantofi casual',      rx: /./ },
  ],
  'incaltaminte-barbati': [
    { slug: 'sneakers',          label: 'Sneakers',            rx: /sneaker/ },
    { slug: 'pantofi-sport',     label: 'Pantofi sport',       rx: /pantofi sport|sport|running|alergare|trail|tenisi/ },
    { slug: 'pantofi-eleganti',  label: 'Pantofi eleganți',    rx: /derby|oxford|eleganti|elegant|brogue|monk/ },
    { slug: 'mocasini',          label: 'Mocasini & loafers',  rx: /mocasin|loafer/ },
    { slug: 'ghete-bocanci',     label: 'Ghete & bocanci',     rx: /ghete|gheata|bocanci|botine|cizme/ },
    { slug: 'sandale-papuci',    label: 'Sandale & papuci',    rx: /sandal|papuci|slapi|saboti|sabot|crocs|ciocate|flip-flop|\bsan\b/ },
    { slug: 'pantofi-casual',    label: 'Pantofi casual',      rx: /./ },
  ],
  'incaltaminte-copii': [
    { slug: 'sneakers-sport', label: 'Sneakers & sport', rx: /sneaker|sport|tenisi/ },
    { slug: 'ghete-cizme',    label: 'Ghete & cizme',    rx: /ghete|gheata|cizme|bocanci|botine/ },
    { slug: 'sandale-papuci', label: 'Sandale & papuci', rx: /sandal|papuci|slapi|saboti/ },
    { slug: 'pantofi',        label: 'Pantofi',          rx: /./ },
  ],
  imbracaminte: [
    { slug: 'rochii',             label: 'Rochii',                rx: /rochie|rochii/ },
    { slug: 'fuste',              label: 'Fuste',                 rx: /\bfusta|\bfuste/ },
    { slug: 'compleuri',          label: 'Compleuri & salopete',  rx: /compleu|salopet|imbracaminte > compleuri/ },
    { slug: 'bluze-topuri',       label: 'Bluze & topuri damă',   rx: /imbracaminte > bluze|\btop\b|\bbody\b|\bcorset/ },
    { slug: 'tricouri',           label: 'Tricouri & polo',       rx: /tricou|maiou|\bpolo\b/ },
    { slug: 'camasi',             label: 'Cămăși',                rx: /camasa|camasi/ },
    { slug: 'pulovere-hanorace',  label: 'Pulovere & hanorace',   rx: /pulover|cardigan|hanorac|bluza|bluze/ },
    { slug: 'sacouri-costume',    label: 'Sacouri & costume',     rx: /sacou|blazer|costum(?! de baie)/ },
    { slug: 'geci-paltoane',      label: 'Geci, jachete & paltoane', rx: /geaca|geci|jacheta|jachete|parka|bomber|palton|trench|vesta|veste|pardesi/ },
    { slug: 'blugi',              label: 'Blugi',                 rx: /(?<!pantaloni si )blugi|\bjeans?\b/ },
    { slug: 'pantaloni',          label: 'Pantaloni',             rx: /pantalon|bermud|shorts?/ },
    { slug: 'costume-baie',       label: 'Costume de baie',       rx: /de baie|inot|swim/ },
    { slug: 'lenjerie-pijamale',  label: 'Lenjerie, pijamale & șosete', rx: /boxeri|chilot|sosete|pijama|lenjerie|\bslip|sutien|bustier|colanti/ },
    { slug: 'alte-haine',         label: 'Altele',                rx: /./ },
  ],
  'genti-accesorii': [
    { slug: 'rucsacuri',          label: 'Rucsacuri',             rx: /rucsac/ },
    { slug: 'genti-calatorie',    label: 'Călătorie & organizatoare',             rx: /calatorie|bagaj|pasaport|termo|prim ajutor|troler|trolley|cosmetice|necessaire|trusa/ },
    { slug: 'genti-barbati',      label: 'Genți bărbați',         rx: /servieta|borseta|genti barbati|geanta.*barbat|barbat.*geanta|crossbody.*barbat/ },
    { slug: 'posete-genti-dama',  label: 'Poșete & genți damă',   rx: /poseta|geanta|genti|clutch|tote|plic/ },
    { slug: 'portofele',          label: 'Portofele',             rx: /portofel|portmoneu|port card|portcard|cardholder/ },
    { slug: 'curele',             label: 'Curele',                rx: /curea|curele/ },
    { slug: 'palarii-sepci',      label: 'Pălării, șepci & căciuli', rx: /sapca|sepci|palari|caciul|bereta/ },
    { slug: 'manusi-fulare',      label: 'Mănuși, fulare & eșarfe', rx: /manusi|fular|esarf|sal\b/ },
    { slug: 'cravate-papioane',   label: 'Cravate & papioane',    rx: /cravat|papion/ },
    { slug: 'umbrele',            label: 'Umbrele',               rx: /umbrel/ },
    { slug: 'ingrijire-incaltaminte', label: 'Îngrijire încălțăminte', rx: /siret|brant|brand magic|spray|crema|impermeabil|perie|calapod|soseta invizibila|ulei piele|lotiune|solutie|curatare|burete/ },
    { slug: 'cadouri-seturi',     label: 'Seturi cadou',          rx: /set cadou|\bset\b/ },
    { slug: 'brelocuri-pixuri',   label: 'Brelocuri & pixuri',    rx: /breloc|\bpix\b/ },
    { slug: 'alte-accesorii',     label: 'Alte accesorii',        rx: /./ },
  ],
};

// ── EXCLUDERI ───────────────────────────────────────────────────────────
// Manichiura Picadili → merge pe beauty-healths.com
const RX_MANICHIURA = /unghii|manichiura|oja|rubber base|tipsuri|geluri|gel uv|pile unghii|buffer|cuticul|pigmenti|sclipici|strasuri|caviar|servetele unghii/;
// Servicii watchshop (gravură etc.) — nu sunt produse de listat
const RX_SERVICII = /\/servicii\//;

// ── GEN (pentru secțiunile "Cadouri pentru ea / el" și email) ───────────
function genOf(p, t, cats) {
  if (cats.includes('copii')) return 'copii';
  if (cats.includes('cadouri-pentru-ea') && !cats.includes('cadouri-pentru-el')) return 'ea';
  if (cats.includes('cadouri-pentru-el') && !cats.includes('cadouri-pentru-ea')) return 'el';
  const fem = /\bdama\b|femei|femeie|\bwomen\b|\blady\b|-dama\/|de-dama/.test(t);
  const mas = /barbat|barbati|\bmen\b|-barbati\/|barbatesti/.test(t);
  if (cats.includes('femei') && !cats.includes('barbati')) return 'ea';
  if (cats.includes('barbati') && !cats.includes('femei')) return 'el';
  if (fem && !mas) return 'ea';
  if (mas && !fem) return 'el';
  return 'unisex';
}

function firstMatch(list, text) {
  for (const t of list || []) if (t.rx.test(text)) return t.slug;
  return null;
}
function allMatches(list, text) {
  return (list || []).filter((t) => t.rx.test(text)).map((t) => t.slug);
}

const RX_INCALTAMINTE = /^(pantofi|pantof|sneakers?|ghete|gheata|botine|cizme|sandale|papuci|slapi|saboti|mocasini|loafers?|balerini|espadrile|bocanci|ciocate|san|tenisi|crocs)\b/;
const RX_INCALTAMINTE_ORIUNDE = /\b(pantofi|sneakers?|ghete|botine|cizme|sandale|papuci|slapi|saboti|mocasini|loafers?|balerini|espadrile|bocanci|ciocate|tenisi)\b/;

// ── CLASIFICAREA PROPRIU-ZISĂ ───────────────────────────────────────────
// Întoarce { categorie, tip, tipuriExtra[], gen } sau { exclus: motiv }
export function clasifica(p) {
  const src = p.source_site;
  const title = norm(p.title);
  const raw = norm(p.subcategory_raw || '');
  const url = norm((p.official_url || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0]);
  const sub = p.subcategory || '';
  const cats = p.category || [];
  const text = `${title} | ${raw} | ${url} | ${sub}`;

  if (src === 'picadili.ro' && RX_MANICHIURA.test(raw + ' ' + title)) return { exclus: 'manichiura → beauty' };
  if (RX_SERVICII.test(url) || cats.includes('servicii')) return { exclus: 'serviciu' };

  let categorie = null;

  // 1. Watchshop: calea URL-ului spune categoria
  if (src === 'watchshop.ro') {
    const seg = url.split('/').filter(Boolean)[0] || '';
    if (/^rame-ochelari/.test(seg)) categorie = 'rame-ochelari';
    else if (/^ochelari-de-soare/.test(seg)) categorie = 'ochelari-de-soare';
    else if (/^(ceas|smartwatch|curele-si-bratari-ceasuri|cutii-ceasuri)/.test(seg)) categorie = 'ceasuri';
    else if (/^(bijuterii|pandantive|lanturi|bratari|cercei|butoni|brelocuri|inele|coliere|seturi)/.test(seg)) categorie = 'bijuterii';
    else if (/^(portofele|genti|curele)/.test(seg)) categorie = 'genti-accesorii';
  }

  // 2. Ceasuri-shop.ro
  if (!categorie && src === 'ceasuri-shop.ro') {
    categorie = 'ceasuri';
  }

  // 3. Picadili: subcategoria brută
  if (!categorie && src === 'picadili.ro' && raw) {
    if (/^ceasuri/.test(raw)) categorie = 'ceasuri';
    else if (/ochelari de soare/.test(raw)) categorie = 'ochelari-de-soare';
    else if (/argint|charmuri|talisman|pandantiv|glezna/.test(raw)) categorie = 'bijuterii';
    else if (/pijama|chilot|boxeri|sosete|sutien|bustier|colanti/.test(raw)) categorie = 'imbracaminte';
    else categorie = 'genti-accesorii';
  }
  if (!categorie && src === 'picadili.ro') {
    if (cats.includes('bijuterii')) categorie = 'bijuterii';
    else if (/\bceas\b/.test(title)) categorie = 'ceasuri';
    else if (/ochelari de soare/.test(title)) categorie = 'ochelari-de-soare';
    else if (/boxeri|chilot|bustiera|sutien|sosete|pijama|colanti/.test(title)) categorie = 'imbracaminte';
    else categorie = 'genti-accesorii';
  }

  // 3b. DyFashion: „Rochii > …", „Îmbrăcăminte > …", „Încălțăminte > …", „Genți"
  if (!categorie && src === 'dyfashion.ro') {
    if (/^incaltaminte/.test(raw) || RX_INCALTAMINTE.test(title)) categorie = 'incaltaminte-femei';
    else if (/^genti/.test(raw) || /^(geanta|poseta|rucsac|clutch|borseta)\b/.test(title)) categorie = 'genti-accesorii';
    else if (/accesorii/.test(raw) && !/rochie|bluza|fusta|pantalon/.test(title)) categorie = 'genti-accesorii';
    else categorie = 'imbracaminte';
  }

  // 4. Menzo: haine, cu excepția încălțămintei și accesoriilor
  if (!categorie && src === 'menzo.ro') {
    if (/^(sneakers|pantofi|mocasini)-barbati$/.test(sub) || RX_INCALTAMINTE.test(title)) categorie = cats.includes('copii') ? 'incaltaminte-copii' : 'incaltaminte-barbati';
    else if (/^(curea|portmoneu|accesorii-haine)-barbati$/.test(sub) || /^(curea|curele|portofel|sapca|caciula|fular|esarfa|manusi)\b/.test(title)) categorie = 'genti-accesorii';
    else categorie = 'imbracaminte';
  }

  // 5. Încălțăminte + genți + bijuterii din Otter / Gryxx / Benvenuti
  if (!categorie) {
    if (RX_INCALTAMINTE.test(title) || (RX_INCALTAMINTE_ORIUNDE.test(title) && !/geanta|poseta|curea|portofel|siret|brant|spray|crema|sosete/.test(title))) {
      if (cats.includes('copii')) categorie = 'incaltaminte-copii';
      else if (cats.includes('barbati') && !cats.includes('femei')) categorie = 'incaltaminte-barbati';
      else if (cats.includes('femei') && !cats.includes('barbati')) categorie = 'incaltaminte-femei';
      else if (/barbat|barbati|\bmen\b/.test(title)) categorie = 'incaltaminte-barbati';
      else categorie = 'incaltaminte-femei';
    } else if (/^(cercei|cercel|inel|bratara|colier|lantisor|pandantiv|brosa)\b/.test(title)) {
      categorie = 'bijuterii';
    } else if (/^ochelari\b/.test(title)) {
      categorie = 'ochelari-de-soare';
    } else if (/^ceas\b/.test(title)) {
      categorie = 'ceasuri';
    } else {
      categorie = 'genti-accesorii';
    }
  }

  const tip = firstMatch(TIPURI[categorie], text);
  const tipuriExtra = allMatches(TIPURI[categorie + 'Extra'], text);
  const gen = genOf(p, text, cats);

  return { categorie, tip, tipuriExtra, gen };
}
