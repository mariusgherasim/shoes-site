// generate-subcat-email.cjs
// ============================================================
// Email cu top 20 produse cu reduceri dintr-o subcategorie aleasa
//
// Rulare: node generate-subcat-email.cjs
// Output: subcat-email-output.html
// ============================================================

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const PRODUCTS_PATH = path.join(__dirname, 'src', 'data', 'products.json');
const OUTPUT_PATH   = path.join(__dirname, 'subcat-email-output.html');
const TOP_N = 20;

// ── Subcategorii disponibile ──────────────────────────────────
const SUBCATEGORIES = [
  // FEMEI
  { slug: 'sneakers-femei',       label: 'Sneakers Femei',        rule: (p) => p.category?.includes('femei') && /sneakers?/i.test(p.title) },
  { slug: 'stiletto-femei',       label: 'Stiletto Femei',        rule: (p) => p.category?.includes('femei') && /stiletto|stilet[ăa]/i.test(p.title) },
  { slug: 'pantofi-cu-toc-femei', label: 'Pantofi cu Toc Femei',  rule: (p) => p.category?.includes('femei') && /cu toc|toc [îi]nalt|heel/i.test(p.title) },
  { slug: 'pantofi-sport-femei',  label: 'Pantofi Sport Femei',   rule: (p) => p.category?.includes('femei') && /sport|running|trail|alergare/i.test(p.title) },
  { slug: 'sandale-femei',        label: 'Sandale Femei',         rule: (p) => p.category?.includes('femei') && /sandal/i.test(p.title) },
  { slug: 'ghete-femei',          label: 'Ghete Femei',           rule: (p) => p.category?.includes('femei') && /ghet[eă]/i.test(p.title) },
  { slug: 'botine-femei',         label: 'Botine Femei',          rule: (p) => p.category?.includes('femei') && /botin[eă]/i.test(p.title) },
  { slug: 'cizme-femei',          label: 'Cizme Femei',           rule: (p) => p.category?.includes('femei') && /cizm[eă]/i.test(p.title) },
  { slug: 'balerini-femei',       label: 'Balerini Femei',        rule: (p) => p.category?.includes('femei') && /balerina|balerini|ballet flat/i.test(p.title) },
  { slug: 'saboti-femei-crocs',   label: 'Saboți CROCS Femei',    rule: (p) => p.category?.includes('femei') && /crocs/i.test(p.title) },
  { slug: 'saboti-femei',         label: 'Saboți Femei',          rule: (p) => p.category?.includes('femei') && /sabot|clog|mule|papuci/i.test(p.title) && !/crocs/i.test(p.title) },
  { slug: 'poseta',               label: 'Poșete Femei',          rule: (p) => p.category?.includes('femei') && /po[șs]et[ăa]|geant[ăa]|tote|clutch|satchel/i.test(p.title) },
  { slug: 'portmoneu-femei',      label: 'Portmonee Femei',       rule: (p) => p.category?.includes('femei') && /portmoneu|portofel|wallet/i.test(p.title) },
  { slug: 'pantofi-femei',        label: 'Pantofi Femei',         rule: (p) => p.category?.includes('femei') && /pantof|oxford|loafer|mocasin|espadril[ăa]|derby|pump/i.test(p.title) },

  // BARBATI
  { slug: 'sneakers-barbati',      label: 'Sneakers Bărbați',      rule: (p) => p.category?.includes('barbati') && /sneakers?/i.test(p.title) },
  { slug: 'pantofi-sport-barbati', label: 'Pantofi Sport Bărbați', rule: (p) => p.category?.includes('barbati') && /sport|running|trail/i.test(p.title) },
  { slug: 'ghete-barbati',         label: 'Ghete Bărbați',         rule: (p) => p.category?.includes('barbati') && /ghet[eă]/i.test(p.title) },
  { slug: 'pantofi-derby-barbati', label: 'Pantofi Derby Bărbați', rule: (p) => p.category?.includes('barbati') && /derby/i.test(p.title) },
  { slug: 'pantofi-oxford-barbati',label: 'Pantofi Oxford Bărbați',rule: (p) => p.category?.includes('barbati') && /oxford/i.test(p.title) },
  { slug: 'mocasini-barbati',      label: 'Mocasini Bărbați',      rule: (p) => p.category?.includes('barbati') && /mocasin|loafer/i.test(p.title) },
  { slug: 'portmoneu-barbati',     label: 'Portmonee Bărbați',     rule: (p) => p.category?.includes('barbati') && /portmoneu|portofel|wallet/i.test(p.title) },
  { slug: 'curea-barbati',         label: 'Curele Bărbați',        rule: (p) => p.category?.includes('barbati') && /curea|curele|belt/i.test(p.title) },
  { slug: 'pantofi-barbati',       label: 'Pantofi Bărbați',       rule: (p) => p.category?.includes('barbati') && /pantof/i.test(p.title) },
  { slug: 'geanta-crossbody',      label: 'Genți Crossbody',       rule: (p) => /crossbody|cross body|shoulder/i.test(p.title) },
];

// ── Utilitare ────────────────────────────────────────────────
function truncate(s, n = 55) {
  if (!s || s.length <= n) return s || '';
  return s.slice(0, n).trim() + '…';
}

function getSourceLabel(source) {
  if (source === 'gryxx.ro') return 'Gryxx';
  if (source === 'otter.ro') return 'Otter';
  if (source === 'picadili.ro') return 'Picadili';
  return 'Benvenuti';
}

// ── HTML card produs ─────────────────────────────────────────
function productCard(p) {
  const DARK   = '#1a1a1a';
  const GOLD   = '#c8a96e';
  const BORDER = '#e8e8e8';
  const RED    = '#c0392b';
  const FONT   = 'DM Sans, Arial, Helvetica, sans-serif';
  const FONT_D = 'Cormorant Garamond, Georgia, serif';

  const hasOld = p.old_price && p.old_price > p.price;
  const src = getSourceLabel(p.source_site);

  return `
  <td style="width:50%;padding:8px;vertical-align:top;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:#ffffff;border:1px solid ${BORDER};border-radius:2px;">
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
            <img src="${p.image_url || ''}" alt="${truncate(p.title, 40)}"
              width="100%" style="display:block;width:100%;height:auto;" />
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 10px 12px;">
          <div style="font-family:${FONT};font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.06em;">${p.brand || ''}</div>
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

// ── Main ─────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(res => rl.question(q, res)); }

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     EMAIL SUBCATEGORIE — Top 20 reduceri          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Afiseaza subcategoriile disponibile
  console.log('Subcategorii disponibile:\n');
  SUBCATEGORIES.forEach((s, i) => {
    const num = String(i + 1).padStart(2, ' ');
    console.log(`  ${num}. ${s.slug.padEnd(28)} — ${s.label}`);
  });

  // Selectie
  const input = await ask('\nIntroduceți numărul sau slug-ul subcategoriei: ');
  const trimmed = input.trim();

  let chosen;
  const num = parseInt(trimmed);
  if (!isNaN(num) && num >= 1 && num <= SUBCATEGORIES.length) {
    chosen = SUBCATEGORIES[num - 1];
  } else {
    chosen = SUBCATEGORIES.find(s => s.slug === trimmed.toLowerCase());
  }

  if (!chosen) {
    console.log(`\n❌ Subcategoria "${trimmed}" nu a fost găsită.`);
    rl.close(); return;
  }

  console.log(`\n✅ Subcategorie aleasă: ${chosen.label} (${chosen.slug})`);

  // Incarca produsele
  if (!fs.existsSync(PRODUCTS_PATH)) {
    console.error(`❌ Nu găsesc: ${PRODUCTS_PATH}`);
    rl.close(); return;
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const active = products.filter(p => p.draft === false && p.availability && p.price);

  // Filtreaza dupa regula subcategoriei
  const inSubcat = active.filter(p => {
    try { return chosen.rule(p); } catch { return false; }
  });

  console.log(`   Produse în subcategorie: ${inSubcat.length}`);

  // Selecteaza TOP_N cu cele mai mari reduceri
  const withDiscount = inSubcat
    .filter(p => p.old_price && p.old_price > p.price)
    .map(p => ({
      ...p,
      _pct: Math.round((1 - p.price / p.old_price) * 100),
      _sum: Math.round(p.old_price - p.price),
    }))
    .sort((a, b) => b._pct - a._pct)
    .slice(0, TOP_N);

  if (withDiscount.length === 0) {
    console.log(`\n⚠️  Niciun produs cu reducere în ${chosen.label}.`);
    rl.close(); return;
  }

  console.log(`   Cu reducere: ${withDiscount.length} produse selectate`);

  const maxDiscount = Math.max(...withDiscount.map(p => p._pct));
  const topBrands = [...new Set(withDiscount.map(p => p.brand).filter(Boolean))].slice(0, 3);

  // Subiect + preheader
  const subject = `${chosen.label} cu reduceri până la ${maxDiscount}% — ${topBrands.join(', ')} | style.`;
  const preheader = `Top ${withDiscount.length} ${chosen.label.toLowerCase()} cu cel mai mare discount — prețuri comparate zilnic`;

  // HTML email
  const DARK  = '#1a1a1a';
  const GOLD  = '#c8a96e';
  const CREAM = '#faf9f7';
  const FONT  = 'DM Sans, Arial, Helvetica, sans-serif';
  const FONT_D = 'Cormorant Garamond, Georgia, serif';
  const BORDER = '#e8e8e8';

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
    <td colspan="2" style="background:#ffffff;padding:20px 16px 14px;text-align:center;border-bottom:1px solid ${BORDER};">
      <h1 style="font-family:${FONT_D};color:${DARK};font-size:22px;margin:0 0 8px;font-weight:600;">
        ${chosen.label} — reduceri până la ${maxDiscount}%
      </h1>
      <p style="font-family:${FONT};font-size:13px;color:#666;margin:0;">
        Top ${withDiscount.length} produse selectate după cel mai mare discount
      </p>
    </td>
  </tr>

  <!-- TITLU SECTIUNE -->
  <tr>
    <td colspan="2" style="padding:20px 8px 8px;text-align:center;">
      <h2 style="font-family:${FONT_D};color:${DARK};font-size:18px;margin:0;border-top:1px solid ${BORDER};padding-top:16px;">
        🏷️ ${chosen.label}
      </h2>
    </td>
  </tr>

  <!-- PRODUSE -->
  ${productRows(withDiscount)}

  <!-- CTA -->
  <tr>
    <td colspan="2" style="padding:16px 8px;text-align:center;">
      <a href="https://style.gherasimmarius.com/${chosen.slug}/1?utm_source=email&utm_medium=newsletter&utm_campaign=${chosen.slug}"
        target="_blank"
        style="display:inline-block;background:${DARK};color:#fff;font-family:${FONT};font-size:13px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:2px;">
        Vezi toate ${chosen.label.toLowerCase()} →
      </a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td colspan="2" style="padding:16px 8px 20px;text-align:center;border-top:1px solid ${BORDER};">
      <p style="font-family:${FONT};font-size:10px;color:#aaa;margin:0;">
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

========================================
COD HTML:
========================================

${html}
`;

  fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

  console.log(`\n✅ Generat: subcat-email-output.html`);
  console.log(`📧 Subiect: ${subject}`);
  console.log(`📦 Produse: ${withDiscount.length} | Discount max: ${maxDiscount}%`);
  console.log(`\n⏭️  Copiezi codul HTML în blocul Custom HTML din MailerLite.\n`);

  rl.close();
}

main().catch(e => { console.error(e); rl.close(); });
