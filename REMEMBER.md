# REMEMBER.md — styleaccessories.eu (repo shoes-site)

*Actualizat: 19 octombrie 2026 — v5 (după lansare + emailuri + logo-uri). Înlocuiește REMEMBER v2 (style) și PRODUCTS-GHID.md (shop) pentru partea de site.*

---

## 0. Pe scurt

| | |
|---|---|
| Site | **https://styleaccessories.eu** — live din 18.10.2026 |
| Ce a înlocuit | shop.gherasimmarius.com (ceasuri, ochelari) + style.gherasimmarius.com (încălțăminte, genți, haine) |
| Tehnologie | Astro 4, site static, GitHub Pages |
| Repo | `mariusgherasim/shoes-site` — branch `main` |
| Folder local | `C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site` |
| Publicare | **doar manual**, prin `git push` de pe laptop (nimic nu mai rulează automat pe GitHub) |
| Produse | ~31.500 active din 8 magazine (2Performant), 9 categorii |
| Domeniu | cumpărat prin Squarespace, reînnoire automată 2 oct 2028 (18 €) |

---

## 1. Feed-urile (2Performant)

Le descarci din 2Performant → Produse → Feed-uri XML și le pui **direct în folderul `shoes-site`**, cu numele exacte de mai jos (suprascrii fișierele vechi):

| Magazin | Fișier | Ce actualizează | Preț vechi (reducerea) |
|---|---|---|---|
| watchshop.ro | `feed_094c6e277.xml` | `actualizare-json.cjs` | **NU din feed** (feed-ul nu are) → doar din `scrape-promotii.cjs` |
| ceasuri-shop.ro | `feed_79ce7e369.xml` | `actualizare-json.cjs` | din feed |
| benvenuti.com | `feed_72d6dd7c5.xml` | `sync-from-feed.cjs` | din feed |
| otter.ro | `feed_7a8d24d4f.xml` | `sync-from-feed.cjs` | din feed |
| gryxx.ro | `feed_82d2c2bf6.xml` | `sync-from-feed.cjs` | din feed |
| picadili.ro | `feed_f741a4c2e.xml` | `sync-from-feed.cjs` | din feed |
| menzo.ro | `feed_382702c75.xml` | `sync-from-feed.cjs` | din feed |
| dyfashion.ro | `feed_11e3e2429.xml` | `sync-from-feed.cjs` | din feed |

- Feed-urile **nu se urcă pe GitHub** (sunt în `.gitignore`). Rămân doar pe laptop.
- Dacă lipsește un feed, scriptul sare peste magazinul acela și continuă cu restul.
- Feed-ul Picadili se pune și în folderul **beauty** — acolo intră doar produsele de manichiură; aici ele sunt excluse automat.
- Menzo are câte un rând pentru fiecare mărime → scriptul le grupează (3.823 rânduri → ~1.040 produse).
- DyFashion (adăugat 22.10.2026): rochii, bluze, fuste, compleuri, pantaloni, pantofi și genți damă. Feed-ul repetă fiecare produs pe mărimi (7.068 rânduri → ~2.170 produse active). Nu are brand → apare ca „DyFashion”. Rochiile/bluzele etc. merg la Îmbrăcăminte (gen ea), pantofii la Încălțăminte femei, gențile la Genți & accesorii.

**Ce fac scripturile cu produsele:**
- `sync-from-feed.cjs` (5 magazine): actualizează prețul și prețul vechi, adaugă produsele noi, iar produsele dispărute din feed le marchează `draft: true` (nu le șterge).
- `actualizare-json.cjs` (WatchShop + Ceasuri-Shop): adaugă produsele noi, **șterge** produsele dispărute, actualizează prețul; la WatchShop nu atinge prețul vechi.
- `scrape-promotii.cjs` (doar WatchShop): citește `watchshop.ro/promotii` cu Camoufox și scrie prețul vechi real. ~10–15 minute, **doar local**.

---

## 2. Rutina de actualizare (pas cu pas)

Deschizi terminalul (cmd) în folder:
```
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
```

**Pasul 1 — aduci ultima versiune de pe GitHub (OBLIGATORIU, de fiecare dată):**
```
git pull
```

**Pasul 2 — pui cele 8 feed-uri noi în folder** (tabelul de la secțiunea 1).

**Pasul 3 — actualizezi produsele:** dublu-click pe **`actualizare-produse.bat`**
(sau în terminal: `npm run sync` și apoi `npm run raport`)

Rulează, pe rând: `sync-from-feed.cjs` → `actualizare-json.cjs` → `raport-clasificare.mjs`.
Fereastra arată pentru **fiecare magazin** (inclusiv WatchShop și Ceasuri-Shop, la pasul 2/3 — derulezi în jos): feed-ul folosit, câte produse are, câte au fost actualizate / adăugate / scoase. Dacă scrie „Feed lipsă”, fișierul XML nu e în folder sau are alt nume.
La final deschizi **`raport-clasificare.html`** (dublu-click) și verifici că numerele pe categorii arată normal.

**Pasul 4 — reducerile WatchShop (o dată pe săptămână, de preferat înainte de emailul de joi):**
```
node scrape-promotii.cjs
```
Dacă se blochează (Cloudflare), rulezi cu browser vizibil:
```
set HEADLESS=0 && node scrape-promotii.cjs
```

**Pasul 5 — verifici local (opțional, dar recomandat):**
```
npm run dev
```
Deschizi http://localhost:4321 · oprești cu **Ctrl+C**.

**Pasul 6 — publici:**
```
git add -A
git commit -m "chore: actualizare produse"
git push
```
Pe GitHub → tab **Actions** → aștepți bulina verde (~1–2 minute) → site-ul e actualizat.

### Comenzi pentru alte modificări (texte, stickere, bannere)
Același tipar, doar cu alt mesaj:
```
git pull
git add -A
git commit -m "update: sticker Black Friday"
git push
```

---

## 3. Probleme frecvente la push

| Mesaj / situație | Ce faci |
|---|---|
| `rejected … fetch first` sau `Updates were rejected` | Ai uitat `git pull`. Rulezi `git pull`, apoi din nou `git push`. |
| `git pull` deschide un editor (merge message) | Scrii `:wq` și Enter (sau închizi fereastra Notepad, dacă se deschide Notepad). |
| `warning: LF will be replaced by CRLF` | Normal pe Windows, ignori. |
| Bulina roșie ✗ în Actions | Intri pe rulare → job **build** → pasul cu ✗ → citești eroarea (sau îmi trimiți captura). |
| `npm ci` pică în Actions | `package-lock.json` nu e sincronizat: rulezi `npm install` local, apoi `git add -A`, commit, push. |
| În `git status` apar `feed_*.xml` | Nu le urca. Verifici că `.gitignore` conține `feed_*.xml`. |
| Site-ul arată vechi după push | Ctrl+F5 în browser; dacă tot vechi, verifici bulina din Actions. |

**Nu urca niciodată:** `node_modules/`, `dist/`, `.astro/`, feed-urile XML (toate sunt deja în `.gitignore`).

---

## 4. Comenzi utile

| Comandă | Ce face |
|---|---|
| `npm install` | instalează dependențele (prima dată pe un calculator nou sau după ce se schimbă `package.json`) |
| `npx camoufox-js fetch` | descarcă browserul Camoufox (~300 MB), o singură dată pe calculator, pentru `scrape-promotii.cjs` |
| `npm run dev` | site-ul local, cu reîncărcare automată |
| `npm run build` | construiește site-ul complet în `dist/` (test final, ca pe GitHub) |
| `npm run preview` | servește `dist/` local, după build |
| `npm run sync` | `sync-from-feed.cjs` + `actualizare-json.cjs` |
| `npm run raport` | regenerează `raport-clasificare.html` |
| `node find-products.cjs --brand Casio` | caută produse în `products.json` |
| `node scrape-promotii.cjs` | prețurile vechi WatchShop |
| `node descarca-logo-uri.mjs` | descarcă logo-urile brandurilor în `public/logos/` (vezi §11b) |
| `node genereaza-email.mjs` | emailul zilnic (vezi §11) |
| `git status` | vezi ce fișiere s-au schimbat înainte de commit |

---

## 5. Unde se schimbă ce

| Vreau să schimb… | Fișier |
|---|---|
| În ce categorie / tip intră produsele | `src/data/clasificare.mjs` → apoi `npm run raport` și verifici |
| Textele categoriilor și colecțiilor (titlu SEO, descriere, intro cu {N}) | `src/data/categorii.js` |
| Stickerele cu reclame (colțul de jos) | `src/data/stickere.js` (are un exemplu gata completat, comentat) |
| Trustpilot, MailerLite, GA4, numele site-ului | `src/data/site.js` |
| Bannerele 2Performant | `public/banners.json` — câmpul `categorii` = pe ce pagini apar; `valid_from` / `valid_until` = perioada |
| Logo-uri de brand în fereastra de căutare | `public/logos/{slug-brand}.png` sau `.svg` (ex: `casio.png`, `michael-kors.png`) — descărcare automată cu `descarca-logo-uri.bat` (vezi §11b) |
| Meniul de sus | `src/components/Header.astro` |
| Footer-ul | `src/components/Footer.astro` |
| Cardul de produs | `src/components/ProductCard.astro` **și** `src/scripts/card.js` (trebuie să rămână identice) |
| Prima pagină | `src/pages/index.astro` |
| Paginile legale | `src/pages/termeni-si-conditii.astro`, `src/pages/politica-de-confidentialitate.astro` |
| Gravura personalizată | `src/pages/gravura-personalizata.astro` (pozele în `public/gravura/`) |
| Ghidurile educative | `src/pages/ghiduri/` (ex. `ingrijire-pantofi-piele-iarna.astro`; produsele din ghid se aleg singure la build) — link în footer, la Colecții |

### Cum adaugi un sticker de reclamă
În `src/data/stickere.js` copiezi blocul de exemplu (fără `//`), completezi `id`, `de_la`, `pana_la`, `pozitie` (`'stanga'` sau `'dreapta'`), `mare`, `eticheta`, `brand`, `text`, `cta`, `link`, `culoare`. Stickerul apare singur între cele două date și dispare singur după `pana_la`. Butonul ✕ îl ascunde doar pe pagina curentă. Stickerul automat **Hot Deals** (dreapta) ia singur cea mai mare reducere și numără până duminică seara.

---

## 6. Clasificarea produselor

- `products.json` rămâne cum îl scriu scripturile. Categoria, tipul și genul se calculează **la build**, în `src/data/clasificare.mjs` — regulile se pot schimba oricând, fără să rulezi din nou sincronizarea.
- Ordinea semnalelor: link-ul oficial (WatchShop are categoria în URL) → subcategoria brută Picadili → subcategoria din sincronizarea style → cuvinte din titlu.
- **Excluse automat:** manichiura Picadili (merge pe beauty-healths.com, ~380 produse) și serviciile WatchShop.
- Tipurile `alte-*` (ex. „Alte modele" la ceasuri — ceasurile WatchShop fără gen în titlu) nu apar ca tip separat în meniu și căutare, dar produsele apar normal în categorie și la branduri.
- **Pandora** are tip separat la Bijuterii (titlurile conțin doar codul, fără tipul de bijuterie).
- **Îmbrăcăminte** = haine damă DyFashion (rochii, bluze & topuri, fuste, compleuri) + haine bărbați Menzo + lenjerie/pijamale/șosete Picadili.

**Ordinea în liste:** întâi produsele cu reducere, după scor (60% procentul + 40% lei economisiți), apoi restul. Reducerile peste 85% (de obicei preț vechi umflat în feed, ex. Picadili) trec la final și nu apar în titluri („până la -X%") sau pe prima pagină.

---

## 7. Structura site-ului

| Pagini | Adrese |
|---|---|
| Categorii | `/ceasuri/`, `/ochelari-de-soare/`, `/rame-ochelari/`, `/bijuterii/`, `/incaltaminte-femei/`, `/incaltaminte-barbati/`, `/incaltaminte-copii/`, `/imbracaminte/`, `/genti-accesorii/` |
| Tipuri | `/{categorie}/tip/{tip}/` — doar tipurile cu minimum 5 produse |
| Branduri | `/{categorie}/brand/{brand}/` — top 24 branduri cu minimum 5 produse, calculate automat |
| Colecții | `/ofertele-saptamanii/` (featured + reducere > 30%), `/cadouri-pentru-ea/`, `/cadouri-pentru-el/`, `/noutati/`, `/sub-150-lei/`, `/sub-300-lei/` |
| Oferte cu filtre | `/oferte/` — căutare, categorie, brand, reducere minimă, preț, sortare (implicit „Recomandate"); 48 produse + „Arată mai multe" |
| Altele | `/gravura-personalizata/`, `/cautare/`, `/termeni-si-conditii/`, `/politica-de-confidentialitate/` |

- 24 produse pe pagină; ~5.000 de pagini, ~280 MB, build ~30 secunde.
- **Prima pagină:** căutare + statistici → butoane categorii → Oferta săptămânii (12 Hot Deals amestecate pe categorii) → banner → Recomandări (se schimbă la fiecare build) → carduri categorii → gravură.
- **„Nu rata ofertele"** (MailerLite, grup STYLE) apare pe **fiecare pagină**, din `Layout.astro`.
- **Căutarea (ca la beauty):** click în căsuța goală → fereastră cu 6 tipuri/categorii + 6 branduri, 8 produse la hover/atingere; la scriere → rezultate. Fișierele generate la build: `search-index.json`, `cauta/{categorie}.json`, `search-panel/*.json`, `offers-index.json` (format compact, decodat de `src/scripts/compact.js`).
- **Design:** paleta shop (navy `#14213D`, auriu-alamă `#B8863A`, fundal `#F3EEE3`), fonturi Fraunces / Inter / IBM Plex Mono, wordmark `style.accessories` (punctul auriu). Logo-urile: `public/brand/`.

---

## 8. Integrări și ID-uri

| Serviciu | Detalii |
|---|---|
| **GA4** | `G-HS59YL4Y3D` (fluxul „gherasimmarius.com", proprietatea IncaUnCapitol). Cross-domain: beauty-healths.com, gherasimmarius.com (Contains), styleaccessories.eu. Traficul site-ului se vede filtrând după **Hostname**. Eveniment clic produs: `affiliate_click`. |
| **Search Console** | Proprietate de tip Domain `styleaccessories.eu`, verificată prin TXT. Sitemap: `https://styleaccessories.eu/sitemap-index.xml`. Proprietățile vechi shop și style rămân pentru urmărirea mutării traficului. |
| **Trustpilot** | businessUnitId `6ad4bbc3dea7b17b7f05cfb1`, template Review Collector, profil `trustpilot.com/review/styleaccessories.eu`. Link „Scrie o recenzie” (folosit în emailuri): `https://www.trustpilot.com/evaluate/styleaccessories.eu`. **Nu** folosi `trstp.lt/ZytFwyTNmk`, care duce la pagina de cod TrustBox. Bara apare în stânga (desktop) / jos (mobil). |
| **MailerLite** | Cont 1999265, grupul **STYLE** (singurul pentru acest site), formular ID `194310241415857526` (embed `44253038`). Abonații SHOP se mută în STYLE. |
| **2Performant** | aff_code `676a7e7d9`; `styleaccessories.eu` trebuie declarat ca site de promovare. |

---

## 9. Domenii, DNS și repo-uri

**DNS styleaccessories.eu (Squarespace → Custom records):**

| Tip | Host | Valoare |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | mariusgherasim.github.io |
| TXT | @ | google-site-verification=… (Search Console — **nu se șterge**) |
| TXT | @ | trustpilot-one-time-verification-id=… (**nu se șterge**) |

Blocul „Squarespace Defaults" a fost șters (intra în conflict cu GitHub).

**Repo-uri GitHub:**

| Repo | Domeniu | Settings → Pages |
|---|---|---|
| `shoes-site` | styleaccessories.eu | Source: **GitHub Actions** · Enforce HTTPS ✓ |
| `style-redirect` | style.gherasimmarius.com | Deploy from a branch → main / (root) |
| `shop-redirect` | shop.gherasimmarius.com | Deploy from a branch → main / (root) |
| `shop` (vechi) | — (domeniu scos) | păstrat doar ca istoric |

⚠️ La `shoes-site`, Source trebuie să rămână **GitHub Actions**. Dacă e pus pe „Deploy from a branch", GitHub publică fișierele sursă, nu site-ul construit.

**Redirecționările:** fiecare adresă veche (796 shop + 1.493 style) duce la pagina nouă echivalentă (ex. `style…/femei/3` → `/incaltaminte-femei/3/`, `shop…/ceasuri` → `/ceasuri/`). Adresele necunoscute → prima pagină. Se regenerează doar dacă se schimbă structura adreselor noi:
```
npm run build
node genereaza-redirecturi.mjs <products.json vechi shop> <products.json vechi style>
```
apoi conținutul folderelor `redirect-shop/` și `redirect-style/` se urcă în repo-urile respective.

---

## 10. Capcane

- **`git pull` înainte de orice lucru** — GitHub mai face uneori commit-uri singur (ex. fișierul `CNAME`).
- Nu urca `.astro/`, `dist/`, `node_modules/` sau feed-urile.
- După orice schimbare de dependențe: commit și pentru `package-lock.json`.
- `update-prices.cjs` și workflow-ul programat sunt eliminate definitiv. Singurul workflow (`.github/workflows/deploy.yml`) rulează doar la push.
- `scrape-promotii.cjs` nu rulează pe GitHub (Cloudflare blochează IP-urile de server) — doar local.
- Pe `localhost` widget-ul Trustpilot poate apărea ca link simplu — e normal, funcționează complet doar pe domeniu.

---

## 11. Emailurile (MailerLite, grupul STYLE)

| Script | Când | Rezultat |
|---|---|---|
| `node genereaza-email.mjs` (sau dublu-click `email-zilnic.bat`) | zilnic, ~10:30 | `email-output.html` + `email-output-previzualizare.html` |
| `node genereaza-email-categorie.mjs` | când vrei un email tematic | `email-categorie-output.html` + previzualizare |
| `node genereaza-email-ghid.mjs` | email educativ „Ghid: pantofii de piele iarna” | `email-ghid-output.html` + previzualizare; butonul „Citește ghidul” duce la `/ghiduri/ingrijire-pantofi-piele-iarna/` |

**Emailul zilnic** recunoaște singur ziua:
- **🎁 Pentru ea (10) + 🎁 Pentru el (10)**, doar reduceri reale (10–85%, minimum 25 lei economisiți), cu poză, maximum 2 produse de la același brand, amestec pe categorii.
- **Tema zilei** primește 4 din cele 10 locuri: luni ceasuri · marți încălțăminte · miercuri bijuterii · vineri genți & accesorii · sâmbătă îmbrăcăminte · duminică ochelari de soare.
- **Joi = Top reduceri:** doar Hot Deals (minimum 30%), cele mai mari reduceri după scor, fără temă.
- Zilnic selecția se rotește (alta în fiecare zi); joi e mereu topul.
- Test pentru altă zi: `node genereaza-email.mjs --zi=joi` (luni, marti, miercuri, joi, vineri, sambata, duminica).

**Emailul pe categorie:** `node genereaza-email-categorie.mjs` îți afișează lista (categorii + tipuri) și alegi numărul; sau direct `node genereaza-email-categorie.mjs ceasuri/dama`, `incaltaminte-femei/sneakers`, `bijuterii/pandora`. Top 20 reduceri, maximum 3 pe brand.

**În fișierul generat:** 3 variante de subiect (A/B/C) și 3 de preheader (cifre concrete + întrebări retorice) — alegi câte una; apoi codul HTML. Scriptul afișează dimensiunea (limita Gmail: 102 KB; acum ~52 KB).

**Fluxul în MailerLite:**
1. Campaigns → Create → Regular campaign
2. Subject + Preheader: copiezi varianta aleasă
3. Sender: **Style Accessories** · office@gherasimmarius.com
4. Recipients: grupul **STYLE**
5. Drag & drop editor: bloc **Countdown** (nativ, până la 23:59) sus, apoi bloc **Custom HTML** cu codul din fișier
6. **Send a test** (verifici pozele și linkurile), apoi **Send later**, ora 11:00

Linkurile spre site au UTM: `utm_source=mailerlite&utm_medium=email&utm_campaign=zilnic-AAAA-LL-ZZ` (joi: `joi-top-…`, categorie: `categorie-…`). Logo-ul din antet: `public/brand/logo-email.png` (găzduit pe site). Footer: recenzie Trustpilot, divulgare afiliere (fără rândul cross-brand „alte proiecte” — scos la cererea lui Marius), `{$unsubscribe}`.

Piesele comune (șablon HTML, culori, reguli de selecție) sunt în `email-comun.mjs`.

---

## 11b. Logo-urile brandurilor

Logo-urile apar în fereastra de căutare (rândul „Branduri”), ca la beauty. Fără fișier, se afișează numele brandului scris.

- Fișierele stau în `public/logos/{slug}.svg|png|jpg|webp` (ex. `public/logos/casio.svg`). Slug-ul e cel din adresa paginii brandului: `/ceasuri/brand/casio/`.
- **Descărcare automată:** dublu-click pe `descarca-logo-uri.bat` (sau `node descarca-logo-uri.mjs`). Scriptul calculează singur lista brandurilor din `products.json` (aceeași regulă ca site-ul: minimum 5 produse, primele 24 pe categorie), caută logo-ul pe Wikidata/Wikimedia și pe site-ul oficial, apoi deschide raportul `logo-uri-raport-style.html`.
- Brandurile care au deja logo sunt sărite. Pentru un brand greșit: ștergi fișierul din `public\logos\` și rulezi din nou (sau doar pentru el: `node descarca-logo-uri.mjs casio`).
- Mărcile proprii / brandurile mici (OEM, Delis, Haifeng, Zhuhai, Amanda, Flavia Passini etc.) n-au sursă: rămân cu numele scris sau pui logo-ul de mână.
- Sub-branduri care copiază logo-ul principal: Jack & Jones Plus, s.Oliver Big Sizes/Black Label, Epica Premium, BOSS (de la Hugo Boss). Lista e în `ACELASI_LOGO` din script; domeniile sunt în `SURSE`.
- Preluate de la beauty: versace, guess, hugo-boss, armani, valentino.
- Publicare: `git add public/logos descarca-logo-uri.mjs descarca-logo-uri.bat` → `git commit -m "Logo-uri branduri"` → `git push`.

---

## 12. De făcut

- [ ] Ștergerea scripturilor vechi `generate-daily-email.cjs` și `generate-subcat-email.cjs` după testul noului email.
- [ ] Logo-uri de brand: rularea `descarca-logo-uri.bat`, verificarea raportului, ștergerea celor greșite (vezi §11b).
- [ ] Ștergerea grupului SHOP din MailerLite, după primul email trimis către STYLE.
- [ ] Verificare Search Console peste 3 zile: sitemap „Success" și pagini indexate în creștere.
