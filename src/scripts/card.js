// Cardul de produs generat în browser (căutare, oferte cu filtre).
// Trebuie să rămână IDENTIC cu src/components/ProductCard.astro.
import { magazin } from './magazine.js';

const esc = (s) => {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
};

export const HOT_DEAL_SVG = `<span class="hot-deal-badge" aria-label="Hot Deal"><svg viewBox="0 0 56 64" width="56" height="64" xmlns="http://www.w3.org/2000/svg"><path d="M28 2 C18 14 10 20 12 34 C14 46 22 54 28 58 C34 54 42 46 44 34 C46 20 38 14 28 2Z" fill="#E8492C"/><path d="M28 16 C22 24 20 30 22 38 C24 44 26 48 28 52 C30 48 32 44 34 38 C36 30 34 24 28 16Z" fill="#F7A034"/><text x="28" y="36" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="8" font-weight="900" fill="#fff" letter-spacing="0.5">HOT</text><text x="28" y="46" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="7" font-weight="900" fill="#fff" letter-spacing="0.5">DEAL</text></svg></span>`;

// p = produs decodat (src/scripts/compact.js)
export function renderCard(p) {
  const hot = p.pct != null && p.pct > 30;
  return `<a class="product-card" href="${esc(p.u)}" target="_blank" rel="sponsored nofollow noopener"
    data-product-id="${esc(p.id)}" data-brand="${esc(p.b)}" data-title="${esc(p.t)}" data-price="${p.pr}">
    ${hot ? HOT_DEAL_SVG : ''}
    ${p.pct ? `<span class="seal">-${p.pct}%</span>` : ''}
    <div class="thumb">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.t)}" loading="lazy" referrerpolicy="no-referrer" />` : ''}</div>
    <div class="body">
      ${p.b ? `<span class="brand">${esc(p.b)}</span>` : ''}
      <h3>${esc(p.t)}</h3>
      <div class="price-row">
        ${p.op ? `<span class="old-price">${Number(p.op).toFixed(2)} Lei</span>` : ''}
        <span class="price-btn">${Number(p.pr).toFixed(2)} Lei</span>
      </div>
      <span class="shop-src">la ${esc(magazin(p.src))}</span>
    </div>
  </a>`;
}

// Card mic pentru fereastra de sugestii (format scurt din search-panel/*.json)
export function renderMini(p) {
  const disc = p.op && p.op > p.pr;
  return `<a class="sp-card product-card-mini" href="${esc(p.u)}" target="_blank" rel="noopener sponsored nofollow"
     data-product-id="${esc(p.id)}" data-title="${esc(p.t)}" data-brand="${esc(p.b)}" data-price="${p.pr}">
    <span class="sp-img"><img src="${esc(p.img)}" alt="${esc(p.t)}" loading="lazy" width="140" height="140" referrerpolicy="no-referrer" /></span>
    <span class="sp-name">${esc(p.t)}</span>
    <span class="sp-price">${Number(p.pr).toFixed(2)} Lei${disc ? ` <s>${Number(p.op).toFixed(2)}</s>` : ''}</span>
  </a>`;
}

export { esc };
