// Logica ferestrei de sugestii (preluată de la beauty).
import { esc, renderMini } from './card.js';

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// wrap: elementul care conține input-ul și .sp-panel ; url: JSON-ul cu {tipuri, branduri}
export function initPanel(wrap, input, url, gaCat) {
  const panel = wrap.querySelector('.sp-panel');
  const elTipuri = panel.querySelector('.sp-tipuri');
  const elBranduri = panel.querySelector('.sp-branduri');
  const elProduse = panel.querySelector('.sp-produse');
  const elTitlu = panel.querySelector('.sp-titlu');
  const elVezi = panel.querySelector('.sp-vezi');
  let data = null, loading = null, grupuri = {}, deschidere = false;

  const load = () => {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(url).then((r) => r.json()).then((d) => (data = d)).catch(() => (data = { tipuri: [], branduri: [] }));
    return loading;
  };

  function arata(key) {
    const g = grupuri[key];
    if (!g) return;
    panel.querySelectorAll('.sp-item').forEach((el) => el.classList.toggle('active', el.dataset.key === key));
    elTitlu.textContent = g.name;
    elVezi.href = g.url;
    elVezi.textContent = `Vezi toate ${g.count.toLocaleString('ro-RO')} →`;
    elProduse.innerHTML = shuffle(g.p).slice(0, 8).map(renderMini).join('');
  }

  function construieste() {
    const tipuri = shuffle(data.tipuri).slice(0, 6);
    const branduri = shuffle(data.branduri).slice(0, 6);
    grupuri = {};
    tipuri.forEach((g) => (grupuri['t:' + g.slug] = g));
    branduri.forEach((g) => (grupuri['b:' + g.slug] = g));
    elTipuri.innerHTML = tipuri.map((g) => `<button type="button" class="sp-item sp-tip" data-key="t:${esc(g.slug)}">${esc(g.name)}</button>`).join('');
    elBranduri.innerHTML = branduri.map((g) => `<button type="button" class="sp-item sp-brand" data-key="b:${esc(g.slug)}" title="${esc(g.name)}">${
      g.logo ? `<img src="${esc(g.logo)}" alt="${esc(g.name)}" loading="lazy" />` : `<span>${esc(g.name)}</span>`}</button>`).join('');
    elTipuri.closest('.sp-block').hidden = tipuri.length === 0;
    elBranduri.closest('.sp-block').hidden = branduri.length === 0;
    const primul = tipuri[0] ? 't:' + tipuri[0].slug : branduri[0] ? 'b:' + branduri[0].slug : null;
    if (primul) arata(primul); else elProduse.innerHTML = '';
  }

  async function deschide() {
    if (input.value.trim() !== '' || !panel.hidden || deschidere) return;
    deschidere = true;
    await load();
    deschidere = false;
    if (input.value.trim() !== '') return;
    if (!data.tipuri.length && !data.branduri.length) return;
    construieste();
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (typeof gtag === 'function') gtag('event', 'search_panel_open', { category: gaCat });
  }
  function inchide() {
    if (panel.hidden) return;
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  input.addEventListener('focus', deschide);
  input.addEventListener('click', deschide);
  panel.querySelector('.sp-close').addEventListener('click', inchide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') inchide(); });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) inchide(); });
  panel.addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
  const canHover = window.matchMedia('(hover: hover)').matches;
  panel.addEventListener('mouseover', (e) => {
    if (!canHover) return;
    const it = e.target.closest('.sp-item');
    if (it && !it.classList.contains('active')) arata(it.dataset.key);
  });
  panel.addEventListener('click', (e) => {
    const it = e.target.closest('.sp-item');
    if (it) arata(it.dataset.key);
  });
  return { deschide, inchide };
}
