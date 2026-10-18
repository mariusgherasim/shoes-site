# LANSARE — styleaccessories.eu

Pașii, în ordinea exactă. Durată estimată: ~1 oră + așteptarea DNS.

---

## Pasul 1 — Pune proiectul nou în folderul shoes-site (pe laptop)

1. **Fă o copie de siguranță** a folderului actual: copiezi `shoes-site` ca `shoes-site-BACKUP`.
2. Deschizi terminalul în `C:\FOLDER DE LUCRU\PAUL MELINTE\shoes-site` și rulezi:
   ```
   git pull
   ```
3. **Șterge** din `shoes-site` folderele `src`, `public`, `.github` și fișierele vechi:
   `update-prices.cjs`, `actualizare_preturi.bat`, `sync-from-feed.bat`, `products_backup.json`, `subcat-email-output.html`, `daily-email-output.html` (cele care există).
4. **Dezarhivează** `styleaccessories-site.zip` peste folderul `shoes-site` (suprascrie tot).
5. Pune în folder cele 7 feed-uri XML (vezi REMEMBER.md, secțiunea 1).
6. Rulează:
   ```
   npm install
   npm run dev
   ```
   Deschizi http://localhost:4321 și verifici site-ul. Ctrl+C ca să oprești.

⚠️ **Nu face încă push** — întâi pregătim DNS-ul (pasul 2), altfel style.gherasimmarius.com se oprește înainte ca noul domeniu să meargă.

---

## Pasul 2 — DNS pentru styleaccessories.eu (Squarespace)

Domains → **styleaccessories.eu** → DNS → DNS Settings:

1. La **Squarespace Defaults**: șterge înregistrările implicite pentru `@` și `www` (cele care duc la Squarespace).
   **NU** șterge cele două înregistrări TXT (Google și Trustpilot).
2. **Custom records → Add record**, de 4 ori, tip **A**, Host **@**:
   `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`
3. Încă o înregistrare: tip **CNAME**, Host **www**, Data **mariusgherasim.github.io**

---

## Pasul 3 — Publică site-ul nou

În terminal, în `shoes-site`:
```
git rm -r --cached feed_*.xml
git add -A
git commit -m "styleaccessories.eu: site unic shop + style"
git push origin main
```
Apoi pe GitHub → repo **shoes-site** → **Settings → Pages**:
- Source: **GitHub Actions** (rămâne așa)
- Custom domain: șterge `style.gherasimmarius.com`, scrie **`styleaccessories.eu`** → Save
- După ce apare bifa verde la DNS (minute–câteva ore): bifează **Enforce HTTPS**

Verifici în tab-ul **Actions** bulina verde, apoi deschizi https://styleaccessories.eu

---

## Pasul 4 — Redirecționările vechilor adrese

Primești două arhive: `redirect-shop.zip` și `redirect-style.zip`. Pentru fiecare:

1. Pe GitHub → **New repository**: `style-redirect` (respectiv `shop-redirect`), Public, fără README.
2. Dezarhivezi într-un folder nou, deschizi terminalul în el și rulezi (exemplu pentru style):
   ```
   git init
   git add -A
   git commit -m "redirect catre styleaccessories.eu"
   git branch -M main
   git remote add origin https://github.com/mariusgherasim/style-redirect.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `(root)` → Save.
4. Custom domain: `style.gherasimmarius.com` (respectiv `shop.gherasimmarius.com`) → Save → Enforce HTTPS.

**Înainte de pasul 4 pentru shop:** repo-ul vechi **shop** → Settings → Pages → șterge custom domain-ul `shop.gherasimmarius.com` (un domeniu poate fi pe un singur repo). DNS-ul pentru `shop` și `style` din gherasimmarius.com rămâne neschimbat.

Test: deschizi https://shop.gherasimmarius.com/ceasuri și https://style.gherasimmarius.com/femei/1 — trebuie să ajungi pe styleaccessories.eu.

---

## Pasul 5 — Integrări

- **Search Console** (proprietatea styleaccessories.eu, deja verificată): Sitemaps → `https://styleaccessories.eu/sitemap-index.xml` → Submit. Păstrezi proprietățile vechi shop și style ca să urmărești mutarea traficului.
- **2Performant**: adaugă `styleaccessories.eu` ca site de promovare în contul de afiliat (unii comercianți acceptă doar trafic de pe site-uri declarate).
- **GA4**: cross-domain — adaugă `styleaccessories.eu` (Add condition → Contains).
- **Trustpilot**: după verificare, trimite-mi codul widgetului TrustBox; se completează `businessUnitId` și `token` în `src/data/site.js`.
- **MailerLite**: muți abonații din grupul SHOP în STYLE (Subscribers → filtrezi grupul SHOP → Select all → Add to group STYLE). Formularul de pe site trimite deja în STYLE.
