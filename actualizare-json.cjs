/**
 * actualizare-json.cjs
 *
 * Sincronizează products.json cu cele două feed-uri XML (watchshop.ro +
 * ceasuri-shop.ro) — NU face scraping, NU deschide browser. Doar citește
 * feed-urile locale și products.json, aplică regulile stabilite, salvează.
 *
 * Regulile aplicate (identice cu reconcilierea manuală):
 *   - Sincronizare completă: adaugă produsele noi active din feed, șterge
 *     din products.json produsele care nu mai sunt active în feed
 *   - price: mereu actualizat din feed
 *   - old_price:
 *       watchshop.ro    → actualizat DOAR dacă feed-ul oferă o valoare reală
 *                         (feed-ul watchshop.ro nu conține practic niciodată
 *                         old_price real — vezi scrape-promotii.cjs pentru
 *                         singura sursă fiabilă de old_price la acest comerciant)
 *       ceasuri-shop.ro → mereu recalculat din feed (feed-ul chiar conține
 *                         old_price real la acest comerciant)
 *   - draft: false pe toate produsele sincronizate
 *   - curățare &nbsp; / &amp;nbsp; din brand și title
 *   - coliziuni de ID: produsele noi de la ceasuri-shop.ro cu ID deja
 *     existent în catalog primesc prefixul "csh-"
 *   - benvenuti.com NU e atins niciodată
 *
 * Rulare:
 *   node actualizare-json.cjs
 *
 * Fișierele de feed trebuie să fie în același folder cu scriptul, cu
 * numele exacte de mai jos (le poți suprascrie de fiecare dată cu exportul
 * nou din 2Performant).
 */

"use strict";

const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");

const PRODUCTS_PATH = "src/data/products.json";
const FEED_WATCHSHOP = "feed_094c6e277.xml";
const FEED_CEASURI_SHOP = "feed_79ce7e369.xml";

const WATCHSHOP_CAT_MAP = {
  "Ceasuri de mana": "ceasuri", "Ceasuri": "ceasuri", "SmartWatches": "ceasuri",
  "Ochelari de soare": "ochelari-de-soare",
  "Bijuterii": "bijuterii", "Bijuterii de dama": "bijuterii", "Bijuterii barbatesti": "bijuterii",
  "Accesorii ceasuri de mana": "accesorii", "Accesorii smartwatch": "accesorii",
  "Rame ochelari de vedere": "rame-ochelari", "Portofele": "portofele", "Genti": "genti", "Servicii": "servicii",
};

const CEASURI_SHOP_CAT_MAP = {
  "Ceasuri barbatesti": "ceasuri", "Ceasuri dama": "ceasuri", "Ceasuri copii": "ceasuri",
  "Ceasuri de birou": "ceasuri", "Ceasuri de buzunar": "ceasuri", "Smartwatch": "ceasuri",
  "Curele ceas": "accesorii", "Bratari fitness": "accesorii", "Smart Rings": "accesorii",
  "Ochelari Smart": "accesorii", "Smartphone": "accesorii",
  "Promotii": "oferte", "Modele noi": "noutati",
};

function cleanNbsp(text) {
  if (!text) return text;
  let cleaned = String(text).replace(/&amp;nbsp;|&nbsp;/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
}

function loadFeedItems(path) {
  if (!fs.existsSync(path)) {
    console.log(`⚠ Feed negăsit: ${path} — sar peste acest comerciant.`);
    return [];
  }
  const xml = fs.readFileSync(path, "utf8");
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.items?.item || [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

function parseNum(val) {
  if (val === undefined || val === null || val === "") return null;
  const n = parseFloat(String(val).trim());
  return isNaN(n) ? null : n;
}

/**
 * Reconciliază products cu feedItems pentru UN comerciant.
 * updateOldPriceMode:
 *   "keep_unless_feed_has_value" → watchshop.ro
 *   "always_from_feed"           → ceasuri-shop.ro
 */
function reconcile(products, feedItems, sourceSite, catMap, updateOldPriceMode) {
  const feedActive = feedItems.filter(
    (item) => String(item.product_active ?? "").trim() === "true" && item.product_id
  );
  const feedById = {};
  for (const item of feedActive) feedById[String(item.product_id).trim()] = item;
  const feedIds = new Set(Object.keys(feedById));

  const siteIds = new Set(products.filter((p) => p.source_site === sourceSite).map((p) => p.id));
  const other = products.filter((p) => p.source_site !== sourceSite);
  const siteProducts = products.filter((p) => p.source_site === sourceSite);

  const toRemove = new Set([...siteIds].filter((id) => !feedIds.has(id)));
  const toAddIds = [...feedIds].filter((id) => !siteIds.has(id));

  const kept = siteProducts.filter((p) => !toRemove.has(p.id));

  let oldPriceUpdated = 0;
  let nbspFixed = 0;

  for (const p of kept) {
    p.draft = false;
    const f = feedById[p.id];
    if (f) {
      const newPrice = parseNum(f.price);
      if (newPrice !== null) p.price = newPrice;

      const newOld = parseNum(f.old_price);

      if (updateOldPriceMode === "always_from_feed") {
        const valid = newOld !== null && p.price !== null && newOld > p.price;
        const newVal = valid ? newOld : null;
        if (newVal !== (p.old_price ?? null)) {
          p.old_price = newVal;
          oldPriceUpdated++;
        }
      } else {
        // keep_unless_feed_has_value
        if (newOld !== null && newOld !== p.old_price) {
          p.old_price = newOld;
          oldPriceUpdated++;
        }
      }
    }
    if (p.brand && p.brand.includes("nbsp")) { p.brand = cleanNbsp(p.brand); nbspFixed++; }
    if (p.title && p.title.includes("nbsp")) { p.title = cleanNbsp(p.title); }
  }

  const existingIdsGlobal = new Set(products.map((p) => p.id));
  const added = [];
  for (const pid of toAddIds) {
    const f = feedById[pid];
    const price = parseNum(f.price);
    const oldRaw = parseNum(f.old_price);
    const oldPrice =
      updateOldPriceMode === "always_from_feed"
        ? (oldRaw !== null && price !== null && oldRaw > price ? oldRaw : null)
        : oldRaw;

    const catSlug = catMap[String(f.category ?? "").trim()] || "accesorii";
    const imageUrls = String(f.image_urls ?? "");

    let finalId = pid;
    if (existingIdsGlobal.has(finalId)) {
      finalId = sourceSite === "ceasuri-shop.ro" ? `csh-${pid}` : `dup-${pid}`;
    }
    existingIdsGlobal.add(finalId);

    added.push({
      id: finalId,
      source_site: sourceSite,
      brand: cleanNbsp(f.brand ?? ""),
      title: cleanNbsp(f.title ?? ""),
      category: [catSlug],
      price,
      old_price: oldPrice,
      offer_end: null,
      currency: "RON",
      availability: true,
      draft: false,
      image_url: imageUrls ? imageUrls.split(",")[0].trim() : "",
      official_url: f.url ?? "",
      affiliate_url: f.aff_code ?? "",
      specs: {},
    });
  }

  const result = [...other, ...kept, ...added];
  return {
    result,
    stats: { removed: toRemove.size, added: added.length, kept: kept.length, oldPriceUpdated, nbspFixed },
  };
}

function main() {
  let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
  console.log(`Total inițial: ${products.length}`);

  const wsFeed = loadFeedItems(FEED_WATCHSHOP);
  const wsResult = reconcile(products, wsFeed, "watchshop.ro", WATCHSHOP_CAT_MAP, "keep_unless_feed_has_value");
  products = wsResult.result;
  console.log(`\n=== watchshop.ro ===`);
  console.log(`  Șterse (dispărute din feed): ${wsResult.stats.removed}`);
  console.log(`  Adăugate (noi în feed): ${wsResult.stats.added}`);
  console.log(`  Total pe comerciant: ${products.filter((p) => p.source_site === "watchshop.ro").length}`);

  const csFeed = loadFeedItems(FEED_CEASURI_SHOP);
  const csResult = reconcile(products, csFeed, "ceasuri-shop.ro", CEASURI_SHOP_CAT_MAP, "always_from_feed");
  products = csResult.result;
  console.log(`\n=== ceasuri-shop.ro ===`);
  console.log(`  Șterse (dispărute din feed): ${csResult.stats.removed}`);
  console.log(`  Adăugate (noi în feed): ${csResult.stats.added}`);
  console.log(`  Total pe comerciant: ${products.filter((p) => p.source_site === "ceasuri-shop.ro").length}`);

  const wsWithOffer = products.filter((p) => p.source_site === "watchshop.ro" && p.old_price && p.old_price > p.price).length;
  const csWithOffer = products.filter((p) => p.source_site === "ceasuri-shop.ro" && p.old_price && p.old_price > p.price).length;
  const benvenuti = products.filter((p) => p.source_site === "benvenuti.com").length;
  const draftFalse = products.filter((p) => p.draft === false).length;

  console.log(`\n=== Rezumat ===`);
  console.log(`  watchshop.ro cu reducere reală: ${wsWithOffer}`);
  console.log(`  ceasuri-shop.ro cu reducere reală: ${csWithOffer}`);
  console.log(`  benvenuti.com (neatins): ${benvenuti}`);
  console.log(`  Total catalog: ${products.length}`);
  console.log(`  draft:false: ${draftFalse}`);

  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
  console.log(`\n✅ Salvat: ${PRODUCTS_PATH}`);
}

main();
