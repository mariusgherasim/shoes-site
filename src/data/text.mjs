// Utilitare comune pentru potrivirea textului (fara diacritice, pe inceput de cuvant).
// Folosite de catalog.mjs (site) si copiate identic in sync-feeds-local.cjs.
//
// Reguli cuvinte cheie:
//   'imun'           -> orice cuvant care INCEPE cu "imun" (imunitate, imunomed...)
//   'ser='           -> doar cuvantul exact "ser" (nu "serie", "sertar")
//   'pasta de dinti' -> expresia, incepand la inceput de cuvant

export const norm = (s) =>
  ' ' +
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim() +
  ' ';

const kwCache = new Map();
function prepKw(kw) {
  let v = kwCache.get(kw);
  if (!v) {
    const whole = kw.endsWith('=');
    const k = norm(whole ? kw.slice(0, -1) : kw).trim();
    v = whole ? ' ' + k + ' ' : ' ' + k;
    kwCache.set(kw, v);
  }
  return v;
}

export const matchKw = (text, kw) => text.includes(prepKw(kw));
export const any = (text, kws) => kws.some((k) => text.includes(prepKw(k)));

// Cheie de brand: majuscule, fara diacritice, fara punctuatie ("Estée Lauder" -> "ESTEE LAUDER")
export const brandKey = (b) =>
  String(b || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

export function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// "15976" -> "peste 15.000" ; "474" -> "peste 470" ; "28" -> "28"
export function niceCount(n) {
  if (n < 50) return String(n);
  const step = n >= 1000 ? 100 : 10;
  const r = Math.floor(n / step) * step;
  return 'peste ' + r.toLocaleString('ro-RO');
}
