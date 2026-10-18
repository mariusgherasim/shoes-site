// ============================================================
// STICKERE PLUTITOARE (reclame) — fișier editabil
// ============================================================
// Fiecare sticker apare în colțul de jos al paginii (dreapta sau stânga),
// pe toate paginile, între datele de_la și pana_la. Butonul ✕ îl ascunde
// DOAR pe pagina curentă — la următoarea pagină reapare (ca la beauty).
// După pana_la dispare singur, fără să mai umbli la cod.
//
// CUM ADAUGI UN STICKER NOU: copiezi blocul de exemplu de mai jos (fără //),
// completezi câmpurile, salvezi, faci push.
//
//   id         nume unic, fără spații
//   de_la      data de început (AAAA-LL-ZZ)
//   pana_la    finalul ofertei, cu oră (AAAA-LL-ZZTHH:MM:SS+02:00) — countdown-ul numără până aici
//   pozitie    'dreapta' sau 'stanga' (cel mult unul pe fiecare parte)
//   mare       textul mare de sus (ex: '-50%', '2+1', '15')
//   eticheta   textul mic de lângă (poate avea <br>)
//   brand      numele magazinului / brandului
//   text       o frază scurtă despre ofertă
//   cta        textul butonului
//   link       linkul de afiliere 2Performant (sau o pagină a site-ului, ex: /oferte/)
//   culoare    culoarea benzii de sus și a butonului
//
// Stickerul cu id 'hot-deals' e automat: ia singur cea mai mare reducere de
// pe site și numără până duminică seara. Îl poți dezactiva cu activ: false.
// ============================================================

export const STICKERE = [
  { id: 'hot-deals', activ: true, pozitie: 'dreapta' },

  // {
  //   id: 'watchshop-black-friday',
  //   activ: true,
  //   de_la: '2026-11-20',
  //   pana_la: '2026-11-30T23:59:59+02:00',
  //   pozitie: 'stanga',
  //   mare: '-50%',
  //   eticheta: 'Black<br>Friday',
  //   brand: 'WatchShop.ro',
  //   text: 'Ceasuri și ochelari cu până la 50% reducere',
  //   cta: 'Vezi oferta',
  //   link: 'https://event.2performant.com/events/click?ad_type=quicklink&aff_code=676a7e7d9&unique=2e49eab4f&redirect_to=https%253A//www.watchshop.ro/promotii/',
  //   culoare: '#A8402F',
  // },
];
