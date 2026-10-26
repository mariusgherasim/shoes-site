// ============================================================
// GHIDURILE SITE-ULUI — lista pentru pagina /ghiduri/, meniul de sus
// și blocul „Ghiduri utile" de pe paginile de categorie.
// Ghid nou = pagină nouă în src/pages/ghiduri/{slug}.astro + o intrare aici.
//
//   slug        adresa: /ghiduri/{slug}/
//   titlu       titlul cardului
//   descriere   1–2 fraze
//   minute      timp de citit
//   eticheta    categoria afișată pe card (ex: 'Încălțăminte')
//   categorii   pe ce pagini de categorie apare în blocul „Ghiduri utile"
//   data        data publicării (AAAA-LL-ZZ) — cele mai noi apar primele
//   emoji       iconița cardului
// ============================================================
export const ghiduri = [
  {
    slug: 'ingrijire-pantofi-piele-iarna',
    titlu: 'Cum îngrijești pantofii de piele peste iarnă',
    descriere: 'Sare, zăpadă, calorifer: oțet 1:2 pentru petele albe, 20 de ore de uscare, cremă cât o alună — pas cu pas, plus kitul de îngrijire.',
    minute: 7,
    eticheta: 'Încălțăminte',
    categorii: ['incaltaminte-femei', 'incaltaminte-barbati', 'incaltaminte-copii'],
    data: '2026-10-19',
    emoji: '🥾',
  },
];

export const ghiduriSortate = () => [...ghiduri].sort((a, b) => b.data.localeCompare(a.data));
export const ghiduriPentru = (categorie) => ghiduriSortate().filter((g) => g.categorii.includes(categorie));
