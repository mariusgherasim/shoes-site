import { categorii } from '../../data/categorii.js';
import { produseCategorie, produseBrand, brandsCategorie } from '../../data/catalog.mjs';
import { mostra, logo } from '../../data/panel.mjs';
import { jsonResponse } from '../../data/compact.mjs';

// Prima pagină: toate categoriile + brandurile principale (un brand din mai multe
// categorii duce la categoria în care are cele mai multe produse).
export function GET() {
  const tipuri = categorii
    .map((c) => { const l = produseCategorie(c.slug); return { slug: c.slug, name: c.name, url: `/${c.slug}/`, count: l.length, p: mostra(l) }; })
    .filter((g) => g.p.length);
  const map = new Map();
  for (const c of categorii) {
    for (const b of brandsCategorie(c.slug).slice(0, 10)) {
      const list = produseBrand(c.slug, b.slug);
      const e = map.get(b.slug) || { slug: b.slug, name: b.name, best: null, all: [] };
      e.all.push(...list);
      if (!e.best || list.length > e.best.n) e.best = { cat: c.slug, n: list.length };
      map.set(b.slug, e);
    }
  }
  const branduri = [...map.values()].map((e) => ({
    slug: e.slug, name: e.name, url: `/${e.best.cat}/brand/${e.slug}/`, count: e.all.length, logo: logo(e.slug), p: mostra(e.all),
  }));
  return jsonResponse({ tipuri, branduri });
}
