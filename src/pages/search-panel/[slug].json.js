import { categorii } from '../../data/categorii.js';
import { produseTip, produseBrand, tipuriCategorie, brandsCategorie } from '../../data/catalog.mjs';
import { mostra, logo } from '../../data/panel.mjs';
import { jsonResponse } from '../../data/compact.mjs';

export const getStaticPaths = () => categorii.map((c) => ({ params: { slug: c.slug } }));

export function GET({ params }) {
  const cat = params.slug;
  const tipuri = tipuriCategorie(cat)
    .map((t) => ({ slug: t.slug, name: t.name, url: `/${cat}/tip/${t.slug}/`, count: t.count, p: mostra(produseTip(cat, t.slug)) }))
    .filter((g) => g.p.length);
  const branduri = brandsCategorie(cat)
    .map((b) => ({ slug: b.slug, name: b.name, url: `/${cat}/brand/${b.slug}/`, count: b.count, logo: logo(b.slug), p: mostra(produseBrand(cat, b.slug)) }))
    .filter((g) => g.p.length);
  return jsonResponse({ tipuri, branduri });
}
