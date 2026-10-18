// Format compact pentru fișierele JSON citite în browser (căutare, oferte,
// căutarea din categorie). Imaginile se împart în prefix comun + rest, iar
// linkurile 2Performant păstrează doar codurile. Decodarea: src/scripts/compact.js
//
// Produs: [titlu, brand, categorie, pret, pret_vechi, prefix_img, rest_img, campanie, cod_link, magazin]
//   campanie = -1  →  cod_link e adresa completă
import { categorii } from './categorii.js';

const AFF = /^https:\/\/event\.2performant\.com\/events\/click\?ad_type=product_store&unique=([^&]+)&aff_code=676a7e7d9&campaign_unique=([^&]+)$/;

export function encode(list) {
  const catIdx = new Map(categorii.map((c, i) => [c.slug, i]));
  const ip = [], ipI = new Map(), cu = [], cuI = new Map(), s = [], sI = new Map();
  const idx = (arr, map, v) => { if (!map.has(v)) { map.set(v, arr.length); arr.push(v); } return map.get(v); };
  const p = list.map((x) => {
    const img = x.image_url || '';
    const cut = img.lastIndexOf('/') + 1;
    const m = AFF.exec(x.affiliate_url || '');
    return [
      x.title, x.brandName || x.brand || '', catIdx.get(x.categorie) ?? -1,
      x.price, x.old_price || 0,
      idx(ip, ipI, img.slice(0, cut)), img.slice(cut),
      m ? idx(cu, cuI, m[2]) : -1, m ? m[1] : x.affiliate_url,
      idx(s, sI, x.source_site),
    ];
  });
  return { c: categorii.map((k) => [k.slug, k.name]), ip, cu, s, p };
}

export const jsonResponse = (data) =>
  new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
