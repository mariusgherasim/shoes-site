# REMEMBER.md — styleaccessories.eu (repo shoes-site)

*Octombrie 2026 — v3. Înlocuiește ghidurile vechi style (REMEMBER v2) și shop (PRODUCTS-GHID.md) pentru partea de site.*

Site unic care a înlocuit **shop.gherasimmarius.com** (ceasuri, ochelari) și **style.gherasimmarius.com** (încălțăminte, genți, haine).
Astro static pe GitHub Pages, repo `mariusgherasim/shoes-site`, domeniul `styleaccessories.eu` (Squarespace).

---

## 1. Actualizarea produselor (de fiecare dată)

1. Descarci din 2Performant cele 7 feed-uri XML și le pui în folderul proiectului (nume neschimbate):

| Magazin | Fișier |
|---|---|
| watchshop.ro | `feed_094c6e277.xml` |
| ceasuri-shop.ro | `feed_79ce7e369.xml` |
| benvenuti.com | `feed_72d6dd7c5.xml` |
| otter.ro | `feed_7a8d24d4f.xml` |
| gryxx.ro | `feed_82d2c2bf6.xml` |
| picadili.ro | `feed_f741a4c2e.xml` |
| menzo.ro | `feed_382702c75.xml` |

2. Dublu-click pe **`actualizare-produse.bat`**. Rulează, pe rând:
   - `sync-from-feed.cjs` — Benvenuti, Gryxx, Otter, Picadili, Menzo (preț, preț vechi, produse noi, dezactivează ce a dispărut)
   - `actualizare-json.cjs` — WatchShop și Ceasuri-Shop (nu atinge prețul vechi WatchShop)
   - `raport-clasificare.mjs` — scrie `raport-clasificare.html` (deschide-l, verifici categoriile)
3. Pentru reducerile WatchShop (o dată pe săptămână): `node scrape-promotii.cjs` (Camoufox, ~10-15 min, doar local).
4. Verifici local: `npm run dev` → http://localhost:4321
5. Publici:
```
git add -A
git commit -m "chore: actualizare produse"
git push
```
Bulina verde în tab-ul **Actions** = site-ul e live (build ~1-2 minute).

Feed-urile XML **nu se urcă** pe GitHub (sunt în `.gitignore`).

---

## 2. Unde se schimbă ce

| Vreau să schimb… | Fișier |
|---|---|
| În ce categorie / tip intră produsele | `src/data/clasificare.mjs` (apoi `npm run raport`) |
| Textele categoriilor și colecțiilor (titlu SEO, intro cu {N}) | `src/data/categorii.js` |
| Stickerele cu reclame (colțul de jos) | `src/data/stickere.js` |
| Trustpilot, MailerLite, GA4 | `src/data/site.js` |
| Bannerele 2Performant | `public/banners.json` (câmpul `categorii` = pe ce pagini apar) |
| Logo-uri de brand în fereastra de căutare | `public/logos/{slug-brand}.svg` sau `.png` (ex: `casio.png`) |
| Meniul de sus | `src/components/Header.astro` |
| Cardul de produs | `src/components/ProductCard.astro` **și** `src/scripts/card.js` (identice) |

**Regula clasificării** (o singură sursă, la build): products.json rămâne cum îl scriu scripturile; categoria, tipul și genul se calculează în `clasificare.mjs`. Ordinea semnalelor: link-ul oficial (WatchShop are categoria în URL) → subcategoria brută Picadili → subcategoria style → cuvinte din titlu.

**Excluse automat:** manichiura Picadili (merge pe beauty-healths.com) și serviciile WatchShop.

---

## 3. Structura site-ului

- Categorii: `/ceasuri/`, `/ochelari-de-soare/`, `/rame-ochelari/`, `/bijuterii/`, `/incaltaminte-femei/`, `/incaltaminte-barbati/`, `/incaltaminte-copii/`, `/imbracaminte/`, `/genti-accesorii/`
- Tipuri: `/{categorie}/tip/{tip}/` — doar tipurile cu minimum 5 produse; tipurile `alte-*` nu apar în meniu
- Branduri: `/{categorie}/brand/{brand}/` — top 24 branduri cu minimum 5 produse, calculate automat
- Colecții: `/ofertele-saptamanii/` (featured + reducere > 30%), `/cadouri-pentru-ea/`, `/cadouri-pentru-el/`, `/noutati/`, `/sub-150-lei/`, `/sub-300-lei/`
- `/oferte/` — filtre live (căutare, categorie, brand, reducere, preț, sortare), 48 de produse + „Arată mai multe"
- `/gravura-personalizata/`, `/cautare/`, paginile legale
- 24 produse pe pagină; listele încep cu produsele cu cea mai mare reducere
- Prima pagină: Hot Deals (scor 60% procent + 40% lei economisiți, fără reduceri suspecte > 85%), Recomandări (se schimbă la fiecare build), categorii, gravură
- „Nu rata ofertele" (MailerLite, grup STYLE) apare pe **fiecare pagină**, din `Layout.astro`
- Stickerele și bara Trustpilot: ✕ le ascunde doar pe pagina curentă; reapar la pagina următoare

**Căutarea (ca la beauty):** click în căsuța goală → fereastră cu 6 tipuri/categorii + 6 branduri, 8 produse la hover. La scriere → rezultate. Fișiere generate la build: `search-index.json`, `cauta/{categorie}.json`, `search-panel/*.json`, `offers-index.json` (format compact, decodat de `src/scripts/compact.js`).

---

## 4. Redirecționări de la vechile adrese

`node genereaza-redirecturi.mjs <products.json shop vechi> <products.json style vechi>` (după `npm run build`) creează folderele `redirect-shop/` și `redirect-style/`. Fiecare e publicat într-un repo separat (GitHub Pages permite un singur domeniu pe repo):

| Repo | Domeniu | Pages |
|---|---|---|
| `shop-redirect` | shop.gherasimmarius.com | Deploy from a branch → main / root |
| `style-redirect` | style.gherasimmarius.com | Deploy from a branch → main / root |

Fiecare adresă veche → pagina nouă echivalentă (meta refresh 0 + canonical + JS). Adresele necunoscute → `404.html` → prima pagină.

---

## 5. Capcane

- Nu urca folderul `.astro`, `dist/` sau `node_modules/`.
- După orice schimbare de dependențe: commit și pentru `package-lock.json` (altfel `npm ci` pică în Actions).
- `update-prices.cjs` și workflow-ul programat sunt eliminate definitiv; nimic nu mai rulează automat pe GitHub.
- Emailurile (generate-daily-email.cjs, generate-subcat-email.cjs) sunt încă versiunile vechi style — se refac în faza 2 (un singur script, zilnic + joi, „Pentru ea / Pentru el", grupul STYLE).
