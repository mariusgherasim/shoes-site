// generate-daily-email.cjs
// Generează emailul zilnic cu top reduceri femei + bărbați (benvenuti + gryxx mixt)
// Rulare: node generate-daily-email.cjs
// Output: daily-email-output.html

const fs = require("fs");

const products = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const banners = JSON.parse(fs.readFileSync("src/data/banners.json", "utf8"));

// ---- 1. Selectează produsele cu reducere (benvenuti + gryxx mixt) ----
const TOP_N = 10; // produse per sectiune (femei / barbati)

const active = products.filter(
  (p) => p.draft === false && p.availability && p.price && p.old_price && p.old_price > p.price
);

if (active.length === 0) {
  console.log("Nu există produse cu reducere. Nimic de generat.");
  process.exit(0);
}

// Scor combinat: 60% procent reducere + 40% suma economisita
const maxPct = Math.max(...active.map((p) => (1 - p.price / p.old_price) * 100));
const maxSum = Math.max(...active.map((p) => p.old_price - p.price));

active.forEach((p) => {
  p._pct = Math.round((1 - p.price / p.old_price) * 100);
  p._sum = Math.round(p.old_price - p.price);
  p._score = 0.6 * (p._pct / maxPct) + 0.4 * (p._sum / maxSum);
});

// Shuffle zilnic deterministic
function seededShuffle(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  let rngState = Math.abs(hash) || 1;
  const rng = () => {
    rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
    return rngState / 0x7fffffff;
  };
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const today = new Date().toISOString().slice(0, 10);

// Pool: top 40 per categorie dupa scor, shuffle zilnic, primele TOP_N
// MIXT benvenuti + gryxx — nu mai filtram dupa sursa
const femeiPool = active
  .filter((p) => Array.isArray(p.category) && p.category.includes("femei"))
  .sort((a, b) => b._score - a._score)
  .slice(0, 40);

const barbatiPool = active
  .filter((p) => Array.isArray(p.category) && p.category.includes("barbati"))
  .sort((a, b) => b._score - a._score)
  .slice(0, 40);

const femei = seededShuffle(femeiPool, `${today}-femei`).slice(0, TOP_N);
const barbati = seededShuffle(barbatiPool, `${today}-barbati`).slice(0, TOP_N);

console.log(`\nFemei: ${femei.length} produse | Bărbați: ${barbati.length} produse`);
// Afiseaza distributia pe surse
const femSrc = femei.reduce((a,p)=>{a[p.source_site]=(a[p.source_site]||0)+1;return a;},{});
const barSrc = barbati.reduce((a,p)=>{a[p.source_site]=(a[p.source_site]||0)+1;return a;},{});
console.log(`  Femei: ${JSON.stringify(femSrc)}`);
console.log(`  Bărbați: ${JSON.stringify(barSrc)}`);

// ---- 2. Banner zilnic ----
const todayStr = new Date().toISOString().slice(0, 10);
const emailBanners = banners.filter((b) => {
  if (b.type !== "image") return false;
  if (!b.image_url || !b.affiliate_url) return false;
  if (b.startDate && b.startDate > todayStr) return false;
  if (b.endDate && b.endDate < todayStr) return false;
  return true;
});

let chosenBanner = null;
if (emailBanners.length > 0) {
  let hash = 0;
  const seed = `${today}-banner`;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  chosenBanner = emailBanners[Math.abs(hash) % emailBanners.length];
}

// ---- 3. Subiect + Preheader ----
const allSelected = [...femei, ...barbati];
const maxDiscount = Math.max(...allSelected.map(p => p._pct));
const maxEconomy = Math.max(...allSelected.map(p => p._sum));
const topBrands = [...new Set(allSelected.map(p => p.brand).filter(Boolean))].slice(0, 3);

const subject = `Reduceri până la ${maxDiscount}% — ${topBrands.join(", ")} și altele | style.`;
const preheader = `Economisești până la ${maxEconomy} RON azi — produse femei și bărbați cu stoc limitat`;

// ---- 4. HTML ----
const DARK = "#1a1a1a";
const GOLD = "#c8a96e";
const CREAM = "#faf9f7";
const WHITE = "#ffffff";
const MID = "#666";
const BORDER = "#e8e8e8";
const RED = "#c0392b";
const FONT = "DM Sans, Arial, Helvetica, sans-serif";
const FONT_D = "Cormorant Garamond, Georgia, serif";

function truncate(s, n=55) {
  if (!s || s.length <= n) return s || '';
  return s.slice(0, n).trim() + '…';
}

function productCard(p) {
  const hasOld = p.old_price && p.old_price > p.price;
  const src = p.source_site === 'gryxx.ro' ? 'Gryxx' : 'Benvenuti';
  return `
  <td style="width:50%;padding:8px;vertical-align:top;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:${WHITE};border:1px solid ${BORDER};border-radius:2px;">
      <tr>
        <td style="padding:6px 10px 4px;">
          ${hasOld
            ? `<span style="background:${RED};color:#fff;font-family:${FONT};font-size:11px;font-weight:bold;padding:3px 8px;border-radius:10px;">-${p._pct}%</span>`
            : `<span style="font-size:11px;color:transparent;">·</span>`}
          <span style="float:right;font-family:${FONT};font-size:10px;color:#bbb;">${src}</span>
        </td>
      </tr>
      <tr>
        <td>
          <a href="${p.affiliate_url}" target="_blank" style="text-decoration:none;">
            <img src="${p.image_url||''}" alt="${truncate(p.title,40)}"
              width="100%" style="display:block;width:100%;height:auto;" />
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 10px 12px;">
          <div style="font-family:${FONT};font-size:10px;color:${MID};text-transform:uppercase;letter-spacing:.06em;">${p.brand||''}</div>
          <div style="font-family:${FONT};font-size:13px;font-weight:500;color:${DARK};margin:4px 0;">${truncate(p.title)}</div>
          <div style="margin:8px 0 4px;border-top:1px solid ${BORDER};padding-top:8px;">
            ${hasOld
              ? `<span style="color:#aaa;text-decoration:line-through;font-size:11px;">${p.old_price.toFixed(2)} RON</span><br/>`
              : ''}
            <span style="background:${DARK};color:#fff;font-family:${FONT};font-size:13px;font-weight:bold;padding:4px 10px;border-radius:2px;">${p.price.toFixed(2)} RON</span>
          </div>
          ${hasOld ? `<div style="font-family:${FONT};font-size:11px;color:${RED};margin:4px 0;">Economisești ${p._sum} RON</div>` : ''}
          <a href="${p.affiliate_url}" target="_blank"
            style="display:block;text-align:center;background:${DARK};color:#fff;font-family:${FONT};font-size:12px;font-weight:bold;text-decoration:none;padding:9px;border-radius:2px;margin-top:8px;">
            Vezi oferta →
          </a>
        </td>
      </tr>
    </table>
  </td>`;
}

function productRows(items) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    const cells = pair.map(productCard).join('');
    const filler = pair.length === 1 ? '<td style="width:50%;"></td>' : '';
    rows.push(`<tr>${cells}${filler}</tr>`);
  }
  return rows.join('\n');
}

const bannerHtml = chosenBanner ? `
<tr>
  <td colspan="2" style="padding:12px 8px 16px;text-align:center;">
    <a href="${chosenBanner.affiliate_url}" target="_blank" rel="nofollow noopener">
      <img src="${chosenBanner.image_url}" alt="style. — Oferte"
        style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto;" />
    </a>
  </td>
</tr>` : '';

const CROSS_OPTIN = "https://preview.mailerlite.io/forms/1999265/193604931012265713/share";

const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
  style="max-width:600px;margin:0 auto;background:${CREAM};font-family:${FONT};">

  <!-- HEADER -->
  <tr>
    <td colspan="2" style="background:${DARK};padding:24px 16px;text-align:center;">
      <div style="font-family:${FONT_D};font-size:32px;color:#fff;letter-spacing:-0.5px;">
        style<span style="color:${GOLD};">.</span>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:5px;text-transform:uppercase;margin-top:4px;">
        PANTOFI &amp; ACCESORII PREMIUM
      </div>
    </td>
  </tr>

  <!-- INTRO -->
  <tr>
    <td colspan="2" style="background:${WHITE};padding:20px 16px 14px;text-align:center;border-bottom:1px solid ${BORDER};">
      <h1 style="font-family:${FONT_D};color:${DARK};font-size:22px;margin:0 0 8px;font-weight:600;">${subject}</h1>
      <p style="font-family:${FONT};font-size:13px;color:${MID};margin:0;">${preheader}</p>
    </td>
  </tr>

  <!-- BANNER -->
  ${bannerHtml}

  <!-- FEMEI -->
  ${femei.length > 0 ? `
  <tr>
    <td colspan="2" style="padding:20px 8px 8px;text-align:center;">
      <h2 style="font-family:${FONT_D};color:${DARK};font-size:20px;margin:0;border-top:1px solid ${BORDER};padding-top:16px;">
        ♀ Reduceri Femei
      </h2>
    </td>
  </tr>
  ${productRows(femei)}
  <tr>
    <td colspan="2" style="padding:12px 8px;text-align:center;">
      <a href="https://style.gherasimmarius.com/oferte/1"
        style="display:inline-block;background:${DARK};color:#fff;font-family:${FONT};font-size:12px;font-weight:bold;text-decoration:none;padding:10px 24px;border-radius:2px;">
        Vezi toate ofertele femei →
      </a>
    </td>
  </tr>` : ''}

  <!-- BARBATI -->
  ${barbati.length > 0 ? `
  <tr>
    <td colspan="2" style="padding:20px 8px 8px;text-align:center;">
      <h2 style="font-family:${FONT_D};color:${DARK};font-size:20px;margin:0;border-top:1px solid ${BORDER};padding-top:16px;">
        ♂ Reduceri Bărbați
      </h2>
    </td>
  </tr>
  ${productRows(barbati)}
  <tr>
    <td colspan="2" style="padding:12px 8px;text-align:center;">
      <a href="https://style.gherasimmarius.com/oferte/1"
        style="display:inline-block;background:${DARK};color:#fff;font-family:${FONT};font-size:12px;font-weight:bold;text-decoration:none;padding:10px 24px;border-radius:2px;">
        Vezi toate ofertele bărbați →
      </a>
    </td>
  </tr>` : ''}

  <!-- FOOTER -->
  <tr>
    <td colspan="2" style="padding:16px 8px 20px;text-align:center;border-top:1px solid ${BORDER};">
      <p style="font-family:${FONT};font-size:11px;color:${MID};margin:0 0 6px;">
        Vrei să primești și noutăți din alte proiecte Marius Gherasim?
      </p>
      <a href="${CROSS_OPTIN}" target="_blank"
        style="font-family:${FONT};font-size:11px;color:${DARK};text-decoration:underline;">
        Abonează-te aici →
      </a>
      <p style="font-family:${FONT};font-size:10px;color:#aaa;margin:14px 0 0;">
        Prețurile și disponibilitatea pot varia față de site-ul partenerului.<br/>
        Nu mai vrei? <a href="{$unsubscribe}" style="color:#aaa;text-decoration:underline;">Dezabonează-te</a>.
      </p>
    </td>
  </tr>

</table>`.trim();

const output = `SUBIECT:
${subject}

PREHEADER:
${preheader}

⏰ Adaugă blocul "Countdown" DEASUPRA blocului Custom HTML în MailerLite.

========================================
COD HTML:
========================================

${html}
`;

fs.writeFileSync("daily-email-output.html", output, "utf8");
console.log(`\n✅ daily-email-output.html generat`);
console.log(`📧 Subiect: ${subject}`);
console.log(`📦 Femei: ${femei.length} | Bărbați: ${barbati.length}`);
if (chosenBanner) console.log(`🖼️  Banner: ${chosenBanner.id || chosenBanner.title}`);
console.log(`\n⏰ Nu uita blocul Countdown în MailerLite!\n`);
