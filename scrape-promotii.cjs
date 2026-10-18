/**
 * scrape-promotii.cjs
 *
 * 1. Citește feed local feed_094c6e277.xml → actualizează price pentru produsele watchshop.ro
 * 2. Parcurge watchshop.ro/promotii cu camoufox-js → extrage old_price
 * 3. Rotație zilnică: 20 ceasuri + 10 ochelari + 10 cadouri → recomandat: true
 * 4. Salvare finală products.json
 *
 * Setup (o singură dată):
 *   npm install camoufox-js
 *   npx camoufox-js fetch
 *
 * Rulare zilnică:
 *   node scrape-promotii.cjs
 */

"use strict";

const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const PRODUCTS_PATH = "src/data/products.json";
const FEED_LOCAL_PATH = "feed_094c6e277.xml";
const FEED_URL = "https://feeds.2performant.com/feed/094c6e277.xml";
const PROMOTII_BASE = "https://www.watchshop.ro/promotii/pagina";
const PROMOTII_PAGE1 = "https://www.watchshop.ro/promotii/";
const TOTAL_PAGES = 462;
const SAVE_EVERY = 50;
const DELAY_MS = 1000;
const MAX_EMPTY_STREAK = 5;       // după 5 pagini goale consecutive → oprire
const RETRY_WAIT_MS = 20000;      // pauză înainte de reîncercarea unei pagini goale
const HEADLESS = process.env.HEADLESS !== "0"; // HEADLESS=0 → browser vizibil

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const CATEGORY_MAP = {
  'Ceasuri de mana': 'ceasuri', 'Ceasuri': 'ceasuri', 'SmartWatches': 'ceasuri',
  'Ochelari de soare': 'ochelari-de-soare',
  'Bijuterii': 'bijuterii', 'Bijuterii de dama': 'bijuterii', 'Bijuterii barbatesti': 'bijuterii',
  'Accesorii ceasuri de mana': 'accesorii', 'Accesorii smartwatch': 'accesorii',
  'Rame ochelari de vedere': 'rame-ochelari', 'Portofele': 'portofele', 'Genti': 'genti', 'Servicii': 'servicii',
};

function cleanNbsp(text) {
  if (!text) return text;
  let cleaned = String(text).replace(/&amp;nbsp;|&nbsp;/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

// ─── Încărcare + parsare feed (partajată de Pasul 0 și Pasul 1) ──────────────
async function loadFeedItems() {
  let feedXml;

  if (fs.existsSync(FEED_LOCAL_PATH)) {
    console.log(`\n📂 Citesc feed local: ${FEED_LOCAL_PATH}`);
    feedXml = fs.readFileSync(FEED_LOCAL_PATH, "utf8");
  } else {
    console.log("\n📥 Feed local negăsit, descărcare din rețea...");
    try {
      const resp = await axios.get(FEED_URL, {
        timeout: 60000,
        headers: { "User-Agent": "Mozilla/5.0" },
        responseType: "text",
        maxRedirects: 5,
      });
      feedXml = resp.data;
    } catch (err) {
      console.error("❌ Eroare feed:", err.message);
      return [];
    }
  }

  const { XMLParser } = require("fast-xml-parser");
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false });
  const parsed = parser.parse(feedXml);
  const rawItems = parsed?.items?.item || [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

// ─── PASUL 0: sincronizare completă cu feed-ul (adaugă noi, șterge dispărute) ─
function syncWithFeed(products, feedItems) {
  const feedActive = feedItems.filter(
    (item) => String(item.product_active ?? "").trim() === "true" && item.product_id
  );
  const feedIds = new Set(feedActive.map((item) => String(item.product_id).trim()));
  const feedById = {};
  for (const item of feedActive) feedById[String(item.product_id).trim()] = item;

  const watchshopIds = new Set(
    products.filter((p) => p.source_site === "watchshop.ro").map((p) => p.id)
  );

  const toRemove = new Set([...watchshopIds].filter((id) => !feedIds.has(id)));
  const toAddIds = [...feedIds].filter((id) => !watchshopIds.has(id));

  const kept = products.filter((p) => !(p.source_site === "watchshop.ro" && toRemove.has(p.id)));

  const added = [];
  for (const pid of toAddIds) {
    const item = feedById[pid];
    const priceRaw = parseFloat(String(item.price ?? "").trim());
    const oldPriceRaw = parseFloat(String(item.old_price ?? "").trim());
    const catSlug = CATEGORY_MAP[String(item.category ?? "").trim()] || "accesorii";
    const imageUrls = String(item.image_urls ?? "");

    added.push({
      id: pid,
      source_site: "watchshop.ro",
      brand: cleanNbsp(item.brand ?? ""),
      title: cleanNbsp(item.title ?? ""),
      category: [catSlug],
      price: isNaN(priceRaw) ? null : priceRaw,
      old_price: isNaN(oldPriceRaw) ? null : oldPriceRaw,
      offer_end: null,
      currency: "RON",
      availability: true,
      draft: false,
      image_url: imageUrls ? imageUrls.split(",")[0].trim() : "",
      official_url: item.url ?? "",
      affiliate_url: item.aff_code ?? "",
      specs: {},
    });
  }

  const finalProducts = [...kept, ...added];

  console.log(`\n🔄 Pasul 0 — sincronizare feed:`);
  console.log(`   Adăugate (noi în feed): ${added.length}`);
  console.log(`   Șterse (dispărute din feed): ${toRemove.size}`);

  return finalProducts;
}

function parsePrice(text) {
  if (!text) return null;
  let clean = text.replace(/lei/i, "").replace(/\s+/g, "").trim();
  if (clean.includes(".") && clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(",")) {
    clean = clean.replace(",", ".");
  }
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

// Pagina e challenge Cloudflare/Turnstile, nu listă de produse?
function isChallengePage(html) {
  return /Just a moment|challenge-platform|cf-turnstile|Verifying you are human|Checking your browser/i.test(html);
}

function isPlausibleOldPrice(oldPrice, price) {
  if (!oldPrice || !price) return false;
  return oldPrice > price && oldPrice <= price * 5;
}

// ─── PASUL 1: price din feed ──────────────────────────────────────────────────
function updatePricesFromFeed(products, feedItems) {
  const feedMap = {};
  for (const item of feedItems) {
    const pid = String(item.product_id ?? "").trim();
    const active = String(item.product_active ?? "").trim();
    const priceRaw = String(item.price ?? "").trim();
    if (pid && active === "true" && priceRaw) {
      const price = parseFloat(priceRaw);
      if (!isNaN(price)) feedMap[pid] = price;
    }
  }

  console.log(`✔ Feed parsat: ${feedItems.length} produse totale, ${Object.keys(feedMap).length} active cu preț`);

  let updated = 0;
  for (const p of products) {
    if (p.source_site !== "watchshop.ro") continue;
    const feedPrice = feedMap[p.id];
    if (feedPrice !== undefined && p.price !== feedPrice) {
      p.price = feedPrice;
      updated++;
    }
  }

  console.log(`✔ Prețuri actualizate din feed: ${updated}`);
  return updated;
}

// ─── PASUL 2: old_price din pagina de promoții ────────────────────────────────
function extractFromHtml(html) {
  const $ = cheerio.load(html);
  const results = [];

  $("article.product-box").each((_, el) => {
    const formId = $(el).find("form.addtocart-modal").attr("id") || "";
    const pidMatch = formId.match(/add_pbox_product_(\d+)/);
    if (!pidMatch) return;
    const pid = pidMatch[1];

    const oldPriceText = $(el).find(".old-price del").text().trim();
    const oldPrice = parsePrice(oldPriceText);

    const priceText = $(el).find(".discounted strong").text().trim();
    const price = parsePrice(priceText);

    if (pid && oldPrice) results.push({ pid, oldPrice, price });
  });

  return results;
}


// ─── PASUL 3: Rotație zilnică produse recomandate ────────────────────────────
// Selectează zilnic 20 ceasuri + 10 ochelari + 10 cadouri fără old_price
// Seed din dată → selecție deterministă (aceleași produse toată ziua)
function rotateFeatured(products) {
  const today = new Date().toISOString().slice(0, 10); // "2026-08-10"

  // Seed simplu din dată
  function seededRandom(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    return function() {
      h ^= h << 13; h ^= h >> 17; h ^= h << 5;
      return (h >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Pool: active, fără old_price, fără draft
  const pool = products.filter(
    (p) => !p.draft && p.availability !== false && p.price != null &&
           !!p.affiliate_url && !p.old_price
  );

  const ceasuri  = pool.filter((p) => p.category.includes("ceasuri") && !p.category.includes("ochelari-de-soare"));
  const ochelari = pool.filter((p) => p.category.includes("ochelari-de-soare"));
  const cadouri  = pool.filter((p) => p.category.includes("cadouri-pentru-el") || p.category.includes("cadouri-pentru-ea"));

  const rng = seededRandom(today);

  const selected = new Set([
    ...shuffle(ceasuri,  seededRandom(today + "-c")).slice(0, 20).map((p) => p.id),
    ...shuffle(ochelari, seededRandom(today + "-o")).slice(0, 10).map((p) => p.id),
    ...shuffle(cadouri,  seededRandom(today + "-cd")).slice(0, 10).map((p) => p.id),
  ]);

  let setTrue = 0, setFalse = 0;
  for (const p of products) {
    const shouldBe = selected.has(p.id);
    if (!!p.recomandat !== shouldBe) {
      p.recomandat = shouldBe || undefined;
      if (shouldBe) setTrue++; else setFalse++;
    }
    if (!shouldBe && p.recomandat) {
      delete p.recomandat;
      setFalse++;
    }
  }

  console.log(`\n🔄 Rotație recomandate (${today}): ${selected.size} produse selectate`);
  console.log(`   Ceasuri: ${shuffle(ceasuri, seededRandom(today + "-c")).slice(0, 20).length} | Ochelari: ${shuffle(ochelari, seededRandom(today + "-o")).slice(0, 10).length} | Cadouri: ${shuffle(cadouri, seededRandom(today + "-cd")).slice(0, 10).length}`);
}

// ─── PASUL 4: curățare &nbsp;/&amp;nbsp; din brand și title ──────────────────
function cleanNbspFields(products) {
  let brandFixed = 0;
  let titleFixed = 0;

  for (const p of products) {
    if (p.brand && p.brand.includes("nbsp")) {
      p.brand = cleanNbsp(p.brand);
      brandFixed++;
    }
    if (p.title && p.title.includes("nbsp")) {
      p.title = cleanNbsp(p.title);
      titleFixed++;
    }
  }

  console.log(`\n🧹 Pasul 4 — curățare &nbsp;:`);
  console.log(`   brand corectat: ${brandFixed}`);
  console.log(`   title corectat: ${titleFixed}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));

  console.log(`Total produse (înainte de sincronizare): ${products.length}`);

  // PASUL 0 — sincronizare completă cu feed-ul (adaugă noi, șterge dispărute)
  const feedItems = await loadFeedItems();
  if (feedItems.length > 0) {
    products = syncWithFeed(products, feedItems);
  } else {
    console.log("\n⚠ Feed indisponibil — sar peste Pasul 0 (sincronizare), continui cu restul.");
  }

  const wsProducts = products.filter((p) => p.source_site === "watchshop.ro");
  console.log(`\nTotal produse (după sincronizare): ${products.length}`);
  console.log(`watchshop.ro: ${wsProducts.length}`);

  // Index rapid după ID — construit DUPĂ sincronizare, ca să includă produsele noi
  const wsIndex = {};
  for (const p of products) {
    if (p.source_site === "watchshop.ro") wsIndex[p.id] = p;
  }

  // PASUL 1 — price din feed (aceleași date, deja încărcate la Pasul 0)
  if (feedItems.length > 0) {
    updatePricesFromFeed(products, feedItems);
  }

  // PASUL 2 — camoufox-js (pachetul oficial Apify) — old_price, inclusiv pt. produsele noi
  console.log(`\n🔍 Scraping watchshop.ro/promotii (${TOTAL_PAGES} pagini) cu Camoufox...`);

  const { launchOptions } = require("camoufox-js");
  const { firefox } = require("playwright-core");

  const opts = await launchOptions({
    os: "windows",
    humanize: true,
    headless: HEADLESS,
  });

  const browser = await firefox.launch(opts);
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  let totalFound = 0;
  let totalUpdated = 0;
  let pagesScraped = 0;
  let pricesFromSite = 0;
  let emptyStreak = 0;
  let stoppedEarly = false;
  let reachedEnd = false;
  const blockedPages = [];
  const seenPromo = new Set();   // ID-urile văzute pe /promotii în rularea asta

  async function loadPage(url) {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector("article.product-box", { timeout: 10000 }).catch(() => {});
    const html = await page.content();
    return { html, items: extractFromHtml(html) };
  }

  for (let pageNum = 1; pageNum <= TOTAL_PAGES; pageNum++) {
    const url = pageNum === 1 ? PROMOTII_PAGE1 : `${PROMOTII_BASE}${pageNum}/`;

    try {
      let { html, items } = await loadPage(url);

      // Pagină goală → o reîncercăm o dată după pauză (de obicei e challenge Cloudflare)
      if (items.length === 0) {
        const why = isChallengePage(html) ? "challenge Cloudflare" : "0 produse";
        console.log(`\n  ⚠ Pagina ${pageNum}: ${why} — reîncerc în ${RETRY_WAIT_MS / 1000}s...`);
        await delay(RETRY_WAIT_MS);
        ({ html, items } = await loadPage(url));
      }

      if (items.length === 0) {
        if (!isChallengePage(html) && pageNum > 1) {
          // Nu e challenge, doar nu mai sunt produse → am ajuns la finalul listei reale
          console.log(`\n  ℹ Pagina ${pageNum}: listă terminată (nu mai există produse în promoție).`);
          reachedEnd = true;
          break;
        }
        blockedPages.push(pageNum);
        emptyStreak++;
        console.log(`\n  ❌ Pagina ${pageNum}: BLOCATĂ (${emptyStreak}/${MAX_EMPTY_STREAK} consecutive)`);
        if (emptyStreak >= MAX_EMPTY_STREAK) {
          console.log(`\n  🛑 Oprire: Cloudflare blochează scraping-ul începând cu pagina ${pageNum - MAX_EMPTY_STREAK + 1}.`);
          stoppedEarly = true;
          break;
        }
      } else {
        emptyStreak = 0;
      }

      for (const { pid, oldPrice, price } of items) {
        totalFound++;
        seenPromo.add(pid);
        const prod = wsIndex[pid];
        if (!prod) continue;

        // Prețul afișat pe site e sursa de adevăr (feed-ul 2Performant poate fi în urmă)
        if (price && prod.price !== price) {
          prod.price = price;
          pricesFromSite++;
        }

        const currentPrice = price || prod.price;
        if (isPlausibleOldPrice(oldPrice, currentPrice)) {
          if (prod.old_price !== oldPrice) {
            prod.old_price = oldPrice;
            totalUpdated++;
          }
        }
      }
    } catch (err) {
      console.log(`\n  ⚠ Pagina ${pageNum}: ${err.message.split("\n")[0]}`);
    }

    pagesScraped++;

    if (pageNum % 10 === 0) {
      process.stdout.write(`\r  Pagina ${pageNum}/${TOTAL_PAGES} | găsite: ${totalFound} | actualizate: ${totalUpdated}`);
    }

    if (pagesScraped % SAVE_EVERY === 0) {
      fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
      console.log(`\n💾 Salvat progres după pagina ${pageNum}/${TOTAL_PAGES}`);
    }

    await delay(DELAY_MS);
  }

  await browser.close();

  // PASUL 2b — curățare old_price
  // (a) old_price <= price nu e niciodată o reducere reală → null, oricând
  let invalidCleared = 0;
  for (const p of products) {
    if (p.source_site !== "watchshop.ro") continue;
    if (p.old_price != null && p.price != null && p.old_price <= p.price) {
      p.old_price = null;
      invalidCleared++;
    }
  }

  // (b) promoții expirate: produsele cu old_price care NU mai apar pe /promotii
  //     Se face DOAR dacă scanarea a fost completă (nicio pagină blocată) —
  //     altfel am șterge reduceri reale de pe paginile pe care nu le-am văzut.
  let expiredCleared = 0;
  const scanComplete = !stoppedEarly && blockedPages.length === 0 && seenPromo.size > 0;
  if (scanComplete) {
    for (const p of products) {
      if (p.source_site !== "watchshop.ro") continue;
      if (p.old_price != null && !seenPromo.has(p.id)) {
        p.old_price = null;
        expiredCleared++;
      }
    }
  }

  // PASUL 3 — rotație recomandate
  rotateFeatured(products);

  // PASUL 4 — curățare &nbsp;/&amp;nbsp; din brand și title
  cleanNbspFields(products);

  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");

  console.log(`\n\n✅ Gata!`);
  console.log(`   Pagini parcurse: ${pagesScraped}${reachedEnd ? " (finalul listei atins)" : ""}`);
  console.log(`   Produse cu reducere găsite: ${totalFound}`);
  console.log(`   old_price actualizate: ${totalUpdated}`);
  console.log(`   price corectat după site: ${pricesFromSite}`);
  console.log(`   old_price invalide (<= price) șterse: ${invalidCleared}`);
  if (scanComplete) {
    console.log(`   old_price expirate (nu mai sunt în promoție) șterse: ${expiredCleared}`);
  } else {
    console.log(`\n⚠ SCANARE INCOMPLETĂ — pagini blocate: ${blockedPages.length}${stoppedEarly ? " (oprită devreme)" : ""}`);
    console.log(`   Reducerile expirate NU au fost curățate (ar fi fost riscant).`);
    console.log(`   Rulează din nou mai târziu sau cu: set HEADLESS=0 && node scrape-promotii.cjs`);
  }
  console.log(`   recomandate rotite: 40 produse noi`);
}

main().catch(console.error);
