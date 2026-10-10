# REMEMBER.md — shoes-site (style.gherasimmarius.com)

*Ultima actualizare: Septembrie 2026 — v2*

---

## 1. CE FACE FIECARE FIȘIER IMPORTANT

### `generate-daily-email.cjs`
Scriptul care generează **emailul zilnic** cu top reduceri pantofi.

**Ce face concret:**
- Citește `src/data/products.json` și `src/data/banners.json`
- Selectează top 30 femei + top 30 bărbați după scor combinat (60% procent reducere + 40% sumă economisită)
- Amestecă zilnic determinist — în fiecare zi apar 10+10 produse diferite din top 30
- Alege un banner rotativ zilnic din `banners.json` (inclusiv bannerele sociale)
- Generează subiect + preheader automat pe baza produselor selectate
- Scrie rezultatul în `daily-email-output.html`

**Rulare:**
```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
node generate-daily-email.cjs
```

**Output:** `daily-email-output.html` — conține:
- Subiectul emailului (copiezi în MailerLite → Subject)
- Preheader-ul (copiezi în MailerLite → Preheader)
- Codul HTML complet (copiezi în bloc Custom HTML din MailerLite)

---

### `daily-email-output.html`
**Fișierul generat** de scriptul de mai sus. Nu îl editezi manual — se suprascrie la fiecare rulare.

Conținut:
- Linia 1-2: Subiect pentru MailerLite
- Linia 4-5: Preheader pentru MailerLite
- Restul: HTML complet cu produse + banner + footer

---

### `src/data/products.json`
Baza de date cu toate produsele Benvenuti. Se actualizează manual când primești un feed nou.

Câmpuri importante:
- `draft: false` + `availability: true` = produsul apare pe site
- `price` și `old_price` = prețurile curente
- `category` = `["femei"]`, `["barbati"]`, `["copii"]`, `["cadouri-pentru-el"]`, `["cadouri-pentru-ea"]`

---

### `src/data/banners.json`
Bannerele 2Performant Benvenuti. Se actualizează manual când primești bannere noi.

Câmpuri importante:
- `active: true/false` = dacă apare pe site
- `startDate` / `endDate` = intervalul de valabilitate (null = fără restricție)
- `placement` = unde apare: `leaderboard`, `sidebar`, `mobile-rectangle`, `social`
- Bannerele cu `placement: ["social"]` sunt inactive pe site — se folosesc pe Facebook/TikTok/Instagram

---

### `src/data/subcategories.js`
Regulile de clasificare automată a produselor în subcategorii (sneakers-femei, pantofi-derby-barbati etc.).
Nu se modifică decât dacă adaugi subcategorii noi.

---

### `sync-from-feed.cjs` ⭐ SCRIPTUL PRINCIPAL DE ACTUALIZARE
Sincronizează `products.json` direct din feed-ul XML Benvenuti — **fără scraping, fără blocaje**.

**Ce face concret:**
- Caută automat primul fișier `.xml` din folderul `shoes-site`
- Actualizează `price` + `old_price` pentru produsele existente
- Adaugă produse noi din feed
- Șterge din `products.json` produsele care nu mai apar în feed
- Salvează automat `products.json`

**Rulare:** dublu-click pe `sync-from-feed.bat` sau:
```bash
node sync-from-feed.cjs
```

---

### `sync-from-feed.bat`
Dublu-click pentru sincronizare locală din feed XML. Înlocuiește complet `actualizare_preturi.bat`.
La prima rulare instalează automat dependența `@xmldom/xmldom`.

---

### ~~`update-prices.cjs`~~ — OBSOLET, poate fi șters
~~Scraper de prețuri pentru benvenuti.com.~~ Blocat cu 403 de benvenuti.com, nu funcționează.
**Înlocuit de `sync-from-feed.cjs`.**

---

### ~~`actualizare_preturi.bat`~~ — OBSOLET, poate fi șters
~~Dublu-click pentru a rula `update-prices.cjs`.~~ Nu mai are niciun rol.
**Înlocuit de `sync-from-feed.bat`.**

---

### `.github/workflows/deploy.yml`
Workflow GitHub Actions — rulează la fiecare push pe `main`.
Face build Astro + deploy pe GitHub Pages.
**NU mai face scraping de prețuri** (dezactivat — blocat cu 403).

---

## 2. FLUXUL COMPLET DE ACTUALIZARE PRODUSE

### Când primești un feed nou de la Benvenuti:

1. Pui fișierul XML (`feed_XXXX.xml`) în folderul `shoes-site` (înlocuiești cel vechi)
2. Dublu-click pe **`sync-from-feed.bat`** — sincronizează automat în 5-10 secunde
3. Verifici numerele afișate (actualizate / noi / șterse)
4. Faci push:

```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
git add src/data/products.json
git commit -m "chore: sync produse din feed"
git push origin main --force
```

> **Alternativă:** dacă preferi, trimiți fișierele lui Claude și primești `products.json` gata — rezultatele sunt identice.

---

## 3. FLUXUL COMPLET DE TRIMITERE EMAIL ZILNIC

### În fiecare zi (dimineața):

**Pasul 1 — Generezi emailul:**
```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
node generate-daily-email.cjs
```

**Pasul 2 — Deschizi `daily-email-output.html`** în Notepad sau VS Code.
Copiezi:
- Subiectul → în câmpul **Subject** din MailerLite
- Preheader-ul → în câmpul **Preheader** din MailerLite

**Pasul 3 — În MailerLite:**
```
Campaigns → Create campaign → Regular campaign →
→ completezi Subject + Preheader + From name + Reply-to →
→ Drag & drop editor →
→ adaugi bloc Countdown (nativ MailerLite) →
→ adaugi bloc Custom HTML sub Countdown →
→ lipești codul HTML din daily-email-output.html →
→ Send to group: STYLE →
→ Schedule sau Send now
```

**Pasul 4 — Grupul de trimitere:** `STYLE`

---

## 4. SUBIECT MANUAL (exemplu pentru emailul „Colecția de toamnă")

Când vrei să trimiți un email cu subiect manual în loc de cel generat automat:

```
Subiect: Colecția de toamnă, deja disponibilă
Preheader: Peste 28 de branduri, mii de modele — de la pantofi office la sport/casual. Ce cauți acum: eleganță sau confort?
CTA: Vezi colecția →
```

Modifici în `generate-daily-email.cjs` liniile:
```js
const subject = `Colecția de toamnă, deja disponibilă`;
const preheader = `Peste 28 de branduri, mii de modele — de la pantofi office la sport/casual. Ce cauți acum: eleganță sau confort?`;
```
Rulezi din nou scriptul → noul output are subiectul manual.

---

## 5. COMENZI GIT — REFERINȚĂ RAPIDĂ

### Push standard (după orice modificare):
```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
git add -A
git commit -m "descriere modificare"
git push origin main --force
```

### Push doar products.json:
```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
git add src/data/products.json
git commit -m "chore: sync produse din feed"
git push origin main --force
```

### Push doar banners.json:
```bash
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
git add src/data/banners.json
git commit -m "chore: actualizare bannere"
git push origin main --force
```

### Dacă push-ul e respins (non-fast-forward):
```bash
git pull origin main --rebase
git push origin main --force
```

---

## 6. STRUCTURA SITE-ULUI

**URL:** https://style.gherasimmarius.com

**Categorii principale:**
- `/femei/1` — Femei
- `/barbati/1` — Bărbați
- `/copii/1` — Copii
- `/oferte/1` — Oferte (produse cu old_price)
- `/noutati/1` — Noutăți
- `/sub-300-lei/1` — Sub 300 Lei

**Subcategorii femei:**
`/sneakers-femei`, `/stiletto-femei`, `/pantofi-cu-toc-femei`, `/pantofi-sport-femei`, `/sandale-femei`, `/ghete-femei`, `/botine-femei`, `/cizme-femei`, `/balerini-femei`, `/saboti-femei-crocs`, `/saboti-femei`, `/poseta`, `/portmoneu-femei`, `/pantofi-femei`

**Subcategorii bărbați:**
`/sneakers-barbati`, `/pantofi-sport-barbati`, `/ghete-barbati`, `/pantofi-derby-barbati`, `/pantofi-oxford-barbati`, `/mocasini-barbati`, `/portmoneu-barbati`, `/curea-barbati`, `/pantofi-barbati`, `/geanta-crossbody`

**Bijuterii:**
`/bijuterii/1` — Bijuterii Argint (Picadili)

**Subcategorii bijuterii:**
`/cercei-argint`, `/bratari-argint`, `/lantisoare-argint`, `/inele-argint`

---

## 7. DEPLOY

**GitHub repo:** https://github.com/mariusgherasim/shoes-site
**Branch principal:** `main`
**Branch deploy:** `gh-pages`
**GitHub Actions:** `.github/workflows/deploy.yml`
**Deploy automat la:** orice push pe `main`
**Durată build:** ~2-3 minute

---

## 8. BANNERELE 2PERFORMANT — REZUMAT

| ID | Dimensiune | Valabilitate | Folosire |
|---|---|---|---|
| banner-leaderboard-1 | 728×90 | fără dată | Sub navbar pe site |
| banner-sidebar-1 | 300×600 | fără dată | Sidebar desktop |
| banner-sidebar-2 | 300×600 | fără dată | Rezervă sidebar (inactive) |
| banner-leaderboard-2 | 728×90 | 01.11–31.03 | Leaderboard toamnă-iarnă |
| banner-sidebar-3 | 300×600 | 01.11–31.03 | Sidebar toamnă-iarnă |
| banner-rectangle-mobile | 300×250 | 01.11–31.03 | Mobil între produse |
| banner-leaderboard-3 | 728×90 | 01.11–31.03 | Rezervă leaderboard (inactive) |
| banner-social-pinterest-tiktok | 920×1200 | 01.11–31.03 | Pinterest, TikTok, Stories |
| banner-social-facebook-instagram | 1200×1200 | 01.11–31.03 | Facebook post, Instagram feed, email |
| banner-social-facebook-cover | 1920×1080 | 01.11–31.03 | Facebook cover, TikTok video, YouTube |

---

## 9. CONTACTE & LINKURI UTILE

- **MailerLite:** mailerlite.com → contul gherasimmarius
- **Grup email:** `STYLE`
- **2Performant campaign:** `9918fab64` (benvenuti.com/ro)
- **Google Analytics:** G-HS59YL4Y3D
- **Search Console:** style.gherasimmarius.com/sitemap.xml
- **Sendtric (countdown):** sendtric.com → setezi duminică 23:59

---

## 10. SINCRONIZARE LOCALĂ — sync-from-feed.cjs + sync-from-feed.bat

### Ce face
Actualizează `src/data/products.json` cu datele din feed-urile XML Benvenuti + Gryxx + Otter + Picadili:
- **Actualizează prețurile** (price + old_price) pentru produsele existente
- **Adaugă produse noi** din feed care lipsesc din JSON
- **Dezactivează** (draft: true) produsele absente din feed
- **Generează sluguri** pentru produsele noi
- **Clasifică Gryxx** pe categorii + subcategorii după titlu

### Unde se află fișierele
```
shoes-site\sync-from-feed.cjs   ← logica Node.js
shoes-site\sync-from-feed.bat   ← lansator Windows (dublu-click)
```

### Cum rulezi
**Varianta 1 — dublu-click pe `sync-from-feed.bat`**

**Varianta 2 — din cmd:**
```cmd
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
node sync-from-feed.cjs
```

### Feed-uri necesare
Pune XML-urile descărcate din 2Performant **în același folder** cu scriptul.
Scriptul recunoaște automat mai multe variante de nume:

| Sursă | Variante de nume acceptate |
|-------|---------------------------|
| Benvenuti | `feed_benvenuti.xml`, `feed_72d6dd7c5.xml`, `feed_72d6dd7c5_1.xml` |
| Gryxx | `feed_gryxx.xml`, `feed_82d2c2bf6.xml`, `feed_82d2c2bf6_1.xml` |
| Otter | `feed_otter.xml`, `feed_7a8d24d4f.xml`, `feed_7a8d24d4f_1.xml` |
| Picadili | `feed_picadili.xml`, `feed_f741a4c2e.xml`, `feed_f741a4c2e_1.xml` |

### Clasificare automată Gryxx
Produsele Gryxx sunt clasificate pe categorii după câmpul `category` din feed:
- `Femei` / `Fetite` → `femei`
- `Barbati` / `Baieti` → `barbati`
- `Femei, Barbati` → `['femei', 'barbati']`

Și pe subcategorii după cuvinte cheie din titlu:
- `sneakers` → sneakers-femei / sneakers-barbati
- `sport`, `running` → pantofi-sport-femei / pantofi-sport-barbati
- `sandal` → sandale-femei
- `papuci`, `sabot` → saboti-femei
- `pantof`, `loafer`, `mocasin` → pantofi-femei / pantofi-barbati

### Output
- `src/data/products.json` — actualizat direct
- `sync-report.json` — raport cu ce s-a schimbat

### Flux complet după rulare
```cmd
cd "C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site"
git pull -X ours
git add src/data/products.json
git commit -m "chore: sync feeds local"
git push
```

### Furnizori activi
| Sursă | Produse active | Campaign 2Performant |
|-------|---------------|----------------------|
| benvenuti.com | ~1.562 | 9918fab64 |
| gryxx.ro | ~987 | 0c1a7057d |
| otter.ro | ~4.230 | — |
| picadili.ro | ~1.934 | — |

---

## 11. SCRIPTURI EMAIL SUPLIMENTARE

### `generate-subcat-email.cjs` — Email per subcategorie
Generează un email cu **top 20 produse cu reduceri** dintr-o subcategorie aleasă interactiv.

**Rulare:**
```cmd
node generate-subcat-email.cjs
```

**Flux:**
1. Afișează lista cu toate cele 28 de subcategorii numerotate
2. Introduci numărul (ex. `6`) sau slug-ul (ex. `ghete-femei`)
3. Selectează top 20 produse după cel mai mare % reducere
4. Output: `subcat-email-output.html` — copiat în MailerLite Custom HTML

---

## 12. SURSE DE PRODUSE — REZUMAT

| Sursă | Produse | Categorii | Feed |
|-------|---------|-----------|------|
| benvenuti.com | ~1.562 | femei, barbati, copii, accesorii | feed_72d6dd7c5.xml |
| gryxx.ro | ~987 | femei, barbati | feed_82d2c2bf6.xml |
| otter.ro | ~4.230 | femei, barbati, copii, accesorii | feed_7a8d24d4f.xml |
| picadili.ro | ~1.934 | femei, barbati, bijuterii, accesorii | feed_f741a4c2e.xml |

**Total activ:** ~8.600+ produse

### Clasificare categorii Picadili
- `Femei` → `['femei', 'accesorii']` (genți, ceasuri, ochelari, portofele)
- `Barbati` → `['barbati', 'accesorii']`
- `Bijuterii argint dama` → `['bijuterii', 'femei']`
- `Accesorii unghii`, `Manichiura`, `Textile`, `Accesorii` → `['accesorii']`

### Categorii noi adăugate pentru Picadili
- `bijuterii` — categorie nouă în meniu cu 4 subcategorii:
  - `/cercei-argint` — cercei argint dama
  - `/bratari-argint` — brățări și brățări de gleznă
  - `/lantisoare-argint` — lănțișoare și pandantive
  - `/inele-argint` — inele argint

### Clasificare categorii Otter
- `Femei > Pantofi sport` → `['femei']` + subcategorie `pantofi-sport-femei`
- `Femei > Ghete` → `['femei']` + subcategorie `ghete-femei`
- Categorii extrase din câmpul `category` din feed (format: `"Gen > TipProdus"`)

### Subcategorii noi pentru sezonul de toamnă
- `ghete-femei` — ~775 produse (Gryxx, Benvenuti, Otter)
- `botine-femei` — ~83 produse
- `cizme-femei` — ~42 produse
- `ghete-barbati` — ~280 produse
