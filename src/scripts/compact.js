// Decodează fișierele JSON compacte generate de src/data/compact.mjs
export const norm = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function decode(d) {
  return d.p.map((x, i) => {
    const pr = x[3], op = x[4] || null;
    return {
      id: 'x' + i,
      t: x[0], b: x[1], c: x[2], cat: d.c[x[2]] ? d.c[x[2]][0] : '',
      pr, op,
      pct: op && op > pr ? Math.round(100 - (pr / op) * 100) : null,
      img: x[6] ? d.ip[x[5]] + x[6] : '',
      u: x[7] >= 0
        ? `https://event.2performant.com/events/click?ad_type=product_store&unique=${x[8]}&aff_code=676a7e7d9&campaign_unique=${d.cu[x[7]]}`
        : x[8],
      src: d.s[x[9]] || '',
      n: ' ' + norm(x[0] + ' ' + x[1]) + ' ',
      nb: norm(x[1]),
      nt: norm(x[0]),
    };
  });
}
