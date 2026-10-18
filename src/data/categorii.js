// ============================================================
// TEXTE pentru categorii și colecții: titlu SEO, meta description,
// H1 și introducere. {N} se înlocuiește automat la build cu numărul
// real de produse (rotunjit: „peste 13.000").
// Regulile de încadrare a produselor sunt în clasificare.mjs.
// ============================================================

import { CATEGORII } from './clasificare.mjs';

const TEXTE = {
  ceasuri: {
    seoTitle: 'Ceasuri bărbătești și de damă — prețuri și reduceri',
    metaDescription: '{N} de ceasuri de mână, smartwatch-uri și ceasuri automatice: Casio, Tissot, Seiko, Michael Kors, Fossil. Prețuri și reduceri actualizate.',
    intro: 'Cât costă de fapt ceasul pe care îl privești de o lună? Și de ce același model are trei prețuri diferite, în trei magazine? Am adunat {N} de ceasuri — bărbătești, de damă, pentru copii, automatice și smartwatch-uri — ca să vezi dintr-o privire prețul, reducerea și magazinul.',
  },
  'ochelari-de-soare': {
    seoTitle: 'Ochelari de soare pentru bărbați și femei — oferte',
    metaDescription: '{N} de ochelari de soare: Ray-Ban, Polaroid, Carrera, Guess, modele polarizate. Prețuri comparate și reduceri.',
    intro: 'Câte perechi de ochelari ai pierdut sau ai rupt până acum? Și câte dintre ele chiar te protejau de UV? Aici găsești {N} de ochelari de soare pentru bărbați, femei și copii — inclusiv modele polarizate — cu prețuri și reduceri la zi.',
  },
  'rame-ochelari': {
    seoTitle: 'Rame de ochelari de vedere — modele și prețuri',
    metaDescription: '{N} de rame de ochelari de vedere pentru damă, bărbați și copii, de la branduri cunoscute. Prețuri actualizate.',
    intro: 'Ți s-a întâmplat să alegi rama în grabă, la optică, din doar zece modele? Aici ai {N} de rame de vedere — pentru damă, bărbați și copii — ca să alegi liniștit, de acasă, înainte să mergi la optician.',
  },
  bijuterii: {
    seoTitle: 'Bijuterii din argint, Pandora, cercei și brățări',
    metaDescription: '{N} de bijuterii: cercei, brățări, coliere, pandantive, inele, Pandora și argint 925. Prețuri și reduceri actualizate.',
    intro: 'Cauți un cadou care să rămână purtat ani de zile, nu uitat într-un sertar? Aici ai {N} de bijuterii — cercei, brățări, coliere, pandantive, inele și charmuri Pandora — de la mai multe magazine, cu prețul și reducerea la vedere.',
  },
  'incaltaminte-femei': {
    seoTitle: 'Încălțăminte damă — ghete, sneakers, pantofi, sandale',
    metaDescription: '{N} de modele de încălțăminte pentru femei: ghete, botine, sneakers, pantofi eleganți, sandale. Benvenuti, Otter, Gryxx, reduceri actualizate.',
    intro: 'Câte perechi de pantofi ai probat până să găsești una comodă și frumoasă în același timp? Aici sunt {N} de modele pentru femei — ghete și botine, sneakers, pantofi eleganți, sandale și balerini — de la Benvenuti, Otter și Gryxx, cu reducerile la zi.',
  },
  'incaltaminte-barbati': {
    seoTitle: 'Încălțăminte bărbați — pantofi, sneakers, ghete',
    metaDescription: '{N} de modele de încălțăminte pentru bărbați: pantofi eleganți, sneakers, pantofi sport, ghete, mocasini. Prețuri și reduceri.',
    intro: 'Ai o singură pereche „bună" pe care o porți la orice? Aici găsești {N} de modele pentru bărbați — pantofi eleganți derby și oxford, sneakers, pantofi sport, ghete și mocasini — din piele naturală și nu numai, cu prețul redus la vedere.',
  },
  'incaltaminte-copii': {
    seoTitle: 'Încălțăminte copii — sneakers, ghete, sandale',
    metaDescription: '{N} de modele de încălțăminte pentru copii: sneakers, pantofi sport, ghete și sandale. Prețuri și reduceri actualizate.',
    intro: 'De câte ori pe an schimbi mărimea la pantofii copilului? Tocmai de aceea contează prețul. Aici ai {N} de modele pentru copii — sneakers, ghete, sandale — cu reducerile actualizate.',
  },
  imbracaminte: {
    seoTitle: 'Îmbrăcăminte bărbați — tricouri, blugi, pulovere, geci',
    metaDescription: '{N} de articole de îmbrăcăminte: tricouri, cămăși, blugi, pulovere, geci, sacouri și lenjerie. Reduceri actualizate.',
    intro: 'Cât din garderobă porți de fapt? Aici ai {N} de piese care chiar se poartă — tricouri și polo, cămăși, blugi, pulovere, geci și sacouri pentru bărbați, plus lenjerie și pijamale — cu reducerile la zi.',
  },
  'genti-accesorii': {
    seoTitle: 'Genți, poșete, portofele și curele — oferte',
    metaDescription: '{N} de genți, poșete, rucsacuri, portofele, curele și accesorii. Prețuri și reduceri actualizate de la mai multe magazine.',
    intro: 'Poșeta potrivită schimbă toată ținuta — dar de ce să plătești prețul întreg? Aici ai {N} de genți, poșete, rucsacuri, portofele, curele și accesorii, pentru ea și pentru el, cu reducerile la vedere.',
  },
};

export const categorii = CATEGORII.map((c) => ({ ...c, name: c.label, ...TEXTE[c.slug] }));
export const getCategorie = (slug) => categorii.find((c) => c.slug === slug);

// ── COLECȚII (calculate automat în catalog.mjs) ─────────────────────────
export const colectii = [
  {
    slug: 'ofertele-saptamanii',
    name: 'Oferta săptămânii',
    seoTitle: 'Oferta săptămânii — Hot Deals peste 30% reducere',
    metaDescription: '{N} de produse cu reduceri de peste 30%: ceasuri, ochelari, bijuterii, încălțăminte și genți. Hot Deals actualizate.',
    intro: 'Câte oferte „de nerefuzat" ai văzut săptămâna asta care erau de fapt reduceri de 5%? Aici intră doar produsele cu peste 30% reducere reală — {N} de Hot Deals, sortate după cel mai mare discount.',
  },
  {
    slug: 'cadouri-pentru-ea',
    name: 'Cadouri pentru ea',
    seoTitle: 'Cadouri pentru ea — ceasuri, bijuterii, genți, ochelari',
    metaDescription: '{N} de idei de cadouri pentru ea: ceasuri de damă, bijuterii, poșete și ochelari de soare. Prețuri și reduceri.',
    intro: 'Ce îi iei când „are deja tot"? Un ceas de damă, o bijuterie, o poșetă sau o pereche de ochelari de soare — {N} de idei de cadou, cu prețuri și reduceri actualizate.',
  },
  {
    slug: 'cadouri-pentru-el',
    name: 'Cadouri pentru el',
    seoTitle: 'Cadouri pentru el — ceasuri, ochelari, portofele, curele',
    metaDescription: '{N} de idei de cadouri pentru el: ceasuri bărbătești, ochelari de soare, portofele, curele și genți. Prețuri și reduceri.',
    intro: 'Încă o cravată? Mai bine nu. Aici sunt {N} de idei de cadou pentru el — ceasuri bărbătești, ochelari de soare, portofele, curele și genți — cu prețul redus la vedere.',
  },
  {
    slug: 'noutati',
    name: 'Noutăți',
    seoTitle: 'Noutăți — modele noi adăugate',
    metaDescription: '{N} de modele noi: ceasuri, ochelari și accesorii adăugate recent în colecție.',
    intro: 'Cele mai noi modele intrate în colecție — {N} de produse adăugate recent.',
  },
  {
    slug: 'sub-150-lei',
    name: 'Sub 150 lei',
    seoTitle: 'Produse sub 150 lei — ceasuri, bijuterii, accesorii',
    metaDescription: '{N} de produse sub 150 lei: ceasuri, bijuterii, ochelari, accesorii și încălțăminte. Cadouri accesibile.',
    intro: 'Un cadou frumos nu trebuie să coste o avere. Aici ai {N} de produse sub 150 lei, sortate după cea mai mare reducere.',
  },
  {
    slug: 'sub-300-lei',
    name: 'Sub 300 lei',
    seoTitle: 'Produse sub 300 lei — încălțăminte, ceasuri, genți',
    metaDescription: '{N} de produse sub 300 lei: încălțăminte, ceasuri, genți, haine și accesorii. Prețuri și reduceri.',
    intro: 'Buget de 300 de lei? Aici ai {N} de produse care se încadrează — încălțăminte, ceasuri, genți, haine și accesorii — sortate după cea mai mare reducere.',
  },
];
export const getColectie = (slug) => colectii.find((c) => c.slug === slug);
