// Datele ferestrei de sugestii: grupuri (tipuri / categorii / branduri) cu
// câte 12 produse alese aleator la fiecare build.
import fs from 'node:fs';
import path from 'node:path';

const PE_GRUP = 12;
const LOGO_EXT = ['svg', 'png', 'webp', 'jpg'];

export function amesteca(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const scurt = (p) => ({ id: p.uid, t: p.title, b: p.brandName || p.brand || '', pr: p.price, op: p.old_price || null, img: p.image_url, u: p.affiliate_url });
export const mostra = (list) => amesteca(list.filter((p) => p.image_url)).slice(0, PE_GRUP).map(scurt);

// Logo de brand opțional: public/logos/{slug}.svg|png|webp|jpg
export function logo(slug) {
  for (const ext of LOGO_EXT) {
    if (fs.existsSync(path.join(process.cwd(), 'public', 'logos', `${slug}.${ext}`))) return `/logos/${slug}.${ext}`;
  }
  return null;
}
