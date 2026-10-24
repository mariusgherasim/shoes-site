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

export const promotiiActive = (azi = new Date().toISOString().slice(0, 10)) =>
  promotii.filter((p) => !p.expira || p.expira >= azi);
