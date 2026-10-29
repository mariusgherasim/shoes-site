// ============================================================
// PROMOȚII ȘI CODURI DE REDUCERE — fișier editabil
// ============================================================
// Apar sus pe pagina /promotii/ (link din tabul „% Promoții" de pe marginea din dreapta).
// Sub ele, pagina arată automat „Reducerile pe magazine" (calculate din products.json
// la fiecare actualizare) — pe acelea nu trebuie să le scrii aici.
//
// CÂMPURI:
//   id         unic, fără spații (ex: "benvenuti-black-friday")
//   magazin    numele afișat (ex: "Benvenuti")
//   domeniu    site-ul magazinului (ex: "benvenuti.com")
//   titlu      titlul ofertei
//   descriere  1–2 fraze
//   reducere   textul din eticheta mare (ex: "-50%", "-100 lei", "2+1") — sau null
//   cod        codul de reducere, dacă există (ex: "STYLE10") — sau null pentru oferte fără cod.
//              Cu cod, cardul arată „••••10 Afișează codul": la click apare fereastra cu
//              „Copiază codul", apoi clientul apasă „Vezi oferta" și lipește codul în coș.
//   cod_text   (opțional) textul de deasupra codului (ex: "Încă 10% reducere cu codul")
//   link       linkul de afiliat — quicklink 2Performant (vezi CODURI_CAMPANIE mai jos)
//   incepe     (opțional) prima zi în care apare oferta "AAAA-LL-ZZ". Până atunci nu se vede,
//              apoi apare singură, fără push nou. Așa poți pune o campanie din timp.
//   expira     ultima zi a ofertei "AAAA-LL-ZZ" (inclusiv) — sau null dacă nu știm.
//              După această dată oferta dispare singură de pe site.
//   categorii  categoriile site-ului unde e relevantă (ex: ["ceasuri", "bijuterii"])
//   verificat  data la care ai verificat oferta pe site-ul magazinului
//
// Folosește DOAR coduri primite în 2Performant pentru contul tău și verifică în
// condițiile campaniei că sunt permise site-urile de cupoane.
//
// CUM FACI UN QUICKLINK: în 2Performant → campania magazinului → Quicklink → lipești
// adresa paginii de promoție. Sau îl construiești singur:
//   https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=COD_CAMPANIE&redirect_to=ADRESA
//   (în ADRESA, „:" devine „%253A")
// ============================================================

export const CODURI_CAMPANIE = {
  'watchshop.ro': '2e49eab4f',
  'ceasuri-shop.ro': 'ee2808fd9',
  'benvenuti.com': '9918fab64',
  'otter.ro': '7e537fc0d',
  'gryxx.ro': '0c1a7057d',
  'picadili.ro': 'd404a783d',
  'menzo.ro': '479d5acd3',
  'dyfashion.ro': '884f13c4f',
};

// Quicklink 2Performant spre orice pagină a magazinului
export function quicklink(magazin, url) {
  const cod = CODURI_CAMPANIE[magazin];
  if (!cod) return url;
  return `https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=${cod}&redirect_to=${url.replace(/:/g, '%253A')}`;
}

export const promotii = [
  // ── Black Friday 2026 ──
  // Otter „Shoefisticat 3": teasing 29 oct – 2 nov, reduceri 3–8 nov. Toate linkurile → otter.ro/blackfriday.
  // NU prezentăm coduri ca valabile pe articolele Best Deal (3–8 nov).
  {
    id: 'otter-black-friday-teasing',
    magazin: 'Otter',
    domeniu: 'otter.ro',
    titlu: 'Black Friday Otter, 3–8 noiembrie: vezi de acum prețurile Best Deals',
    descriere: 'Pe pagina de Black Friday Otter vezi deja o parte din articolele Best Deals, cu prețul de Black Friday. Le poți salva în wishlist acum, iar de pe 3 noiembrie le poți cumpăra, în 10 valuri. Livrare gratuită de la 299 lei.',
    reducere: 'BF',
    cod: null,
    link: 'https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=7e537fc0d&redirect_to=https%253A//www.otter.ro/blackfriday',
    incepe: '2026-10-29',
    expira: '2026-11-02',
    categorii: ['incaltaminte-femei', 'incaltaminte-barbati', 'incaltaminte-copii', 'genti-accesorii'],
    verificat: '2026-10-29',
  },
  {
    id: 'otter-black-friday',
    magazin: 'Otter',
    domeniu: 'otter.ro',
    titlu: 'Black Friday Otter: reduceri la toate articolele și Best Deals în 10 valuri',
    descriere: 'Între 3 și 8 noiembrie au reducere toate articolele. Best Deals se deblochează în valuri: marți, 3 nov, dimineața și la 10:00, 13:00, 16:00; miercuri și joi la 10:00; vineri, 6 nov, la 07:00, 10:00, 13:00 și 16:00. Din fiecare Best Deal comanzi cel mult o bucată pe mărime, iar codurile de reducere nu se aplică acestor articole. Livrare gratuită de la 299 lei.',
    reducere: 'BF',
    cod: null,
    link: 'https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=7e537fc0d&redirect_to=https%253A//www.otter.ro/blackfriday',
    incepe: '2026-11-03',
    expira: '2026-11-08',
    categorii: ['incaltaminte-femei', 'incaltaminte-barbati', 'incaltaminte-copii', 'genti-accesorii'],
    verificat: '2026-10-29',
  },
  // Menzo: Black Friday „până la -60%". ⚠️ Datele exacte nu erau în descrierea primită — corectează incepe/expira din 2Performant.
  {
    id: 'menzo-black-friday',
    magazin: 'Menzo',
    domeniu: 'menzo.ro',
    titlu: 'Black Friday la Menzo: reduceri de până la 60% la toate produsele',
    descriere: 'Campania de Black Friday Menzo aduce reduceri de până la 60% la toate produsele din magazin: îmbrăcăminte și încălțăminte pentru bărbați și pentru copii.',
    reducere: '-60%',
    cod: null,
    link: 'https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=479d5acd3&redirect_to=https%253A//www.menzo.ro/',
    incepe: '2026-10-29',
    expira: '2026-11-30',
    categorii: ['imbracaminte', 'incaltaminte-barbati', 'incaltaminte-copii'],
    verificat: '2026-10-29',
  },
  {
    id: 'watchshop-promotii',
    magazin: 'WatchShop.ro',
    domeniu: 'watchshop.ro',
    titlu: 'Promoțiile WatchShop: ceasuri, ochelari și bijuterii reduse',
    descriere: 'Pagina cu toate campaniile active WatchShop — ceasuri de mână, ochelari de soare și bijuterii la preț redus.',
    reducere: 'Promo',
    cod: null,
    link: quicklink('watchshop.ro', 'https://www.watchshop.ro/promotii/'),
    expira: null,
    categorii: ['ceasuri', 'ochelari-de-soare', 'bijuterii'],
    verificat: '2026-10-24',
  },

  // {
  //   id: 'benvenuti-black-friday',
  //   magazin: 'Benvenuti',
  //   domeniu: 'benvenuti.com',
  //   titlu: 'Black Friday la Benvenuti',
  //   descriere: 'Pantofi și genți din piele cu până la 50% reducere.',
  //   reducere: '-50%',
  //   cod: null,
  //   link: quicklink('benvenuti.com', 'https://www.benvenuti.com/ro/reduceri'),
  //   expira: '2026-11-30',
  //   categorii: ['incaltaminte-femei', 'incaltaminte-barbati', 'genti-accesorii'],
  //   verificat: '2026-11-20',
  // },
];

// active azi (au început și n-au expirat)
export const promotiiActive = (azi = new Date().toISOString().slice(0, 10)) =>
  promotii.filter((p) => (!p.expira || p.expira >= azi) && (!p.incepe || p.incepe <= azi));
// neexpirate, inclusiv cele programate — intră în pagină ascunse și apar singure în ziua lor
export const promotiiNeexpirate = (azi = new Date().toISOString().slice(0, 10)) =>
  promotii.filter((p) => !p.expira || p.expira >= azi);
