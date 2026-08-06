/**
 * update-prices.cjs
 * Actualizează price/old_price în products.json
 * scraping benvenuti.com cu axios + cheerio (site static, fără JS necesar)
 *
 * Rulare locală: node update-prices.cjs
 * Rulare automată: GitHub Actions (dimineața la 07:00)
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const PRODUCTS_PATH = path.join(__dirname, 'src/data/products.json');
const CONCURRENCY = 1;       // un request pe rând — evităm ban
const DELAY_MS = 2500;       // 2.5s între requests
const MAX_ERRORS = 50;       // circuit breaker: dacă avem 50 de erori consecutive, oprim

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function scrapePrice(url) {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ro-RO,ro;q=0.9',
        'Referer': 'https://www.benvenuti.com/',
      },
    });

    const $ = cheerio.load(res.data);

    const parsePrice = str => {
      if (!str) return null;
      const num = str.replace(/\./g, '').replace(/[^\d,]/g, '').replace(',', '.');
      const val = parseFloat(num);
      return isNaN(val) ? null : val;
    };

    const priceEls = $('.p_price');
    const priceText = priceEls.last().text().trim();
    const oldPriceText = $('.p_old_price').first().text().trim();

    return {
      price: parsePrice(priceText),
      old_price: parsePrice(oldPriceText) || null,
    };
  } catch (err) {
    return { price: null, old_price: null, error: err.message };
  }
}

async function run() {
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
  const products = JSON.parse(raw);

  const toUpdate = products.filter(p => !p.draft && p.official_url);
  console.log(`\nÎncep actualizarea pentru ${toUpdate.length} produse active...\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let consecutiveErrors = 0;

  for (let i = 0; i < toUpdate.length; i++) {
    const product = toUpdate[i];

    if (consecutiveErrors >= MAX_ERRORS) {
      console.error(`\n⚠️  Circuit breaker: ${MAX_ERRORS} erori consecutive. Opresc.`);
      break;
    }

    process.stdout.write(`[${i + 1}/${toUpdate.length}] ${product.brand} — ${product.title.substring(0, 50)}... `);

    const result = await scrapePrice(product.official_url);

    if (result.error) {
      console.log(`❌ ${result.error}`);
      errors++;
      consecutiveErrors++;
      await sleep(DELAY_MS);
      continue;
    }

    if (!result.price) {
      console.log(`⚠️  Preț negăsit`);
      skipped++;
      consecutiveErrors++;
      await sleep(DELAY_MS);
      continue;
    }

    consecutiveErrors = 0;

    // Sanity check: prețul nou nu poate fi de 5x mai mare decât cel vechi
    const existingPrice = product.price;
    if (existingPrice && result.price > existingPrice * 5) {
      console.log(`⚠️  Sanity check eșuat: ${existingPrice} → ${result.price} (ignorat)`);
      skipped++;
      await sleep(DELAY_MS);
      continue;
    }

    // Actualizez în array-ul original
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx].price = result.price;
      products[idx].old_price = result.old_price;
      updated++;
      console.log(`✅ ${result.price} RON${result.old_price ? ` (vechi: ${result.old_price} RON)` : ''}`);
    }

    await sleep(DELAY_MS);
  }

  // Salvez
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Actualizate: ${updated}`);
  console.log(`⚠️  Sărite:     ${skipped}`);
  console.log(`❌ Erori:       ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

run().catch(console.error);
