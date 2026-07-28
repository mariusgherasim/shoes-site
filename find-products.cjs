/**
 * find-products.cjs
 * Caută produse în products.json după diverse criterii
 *
 * Exemple:
 *   node find-products.cjs --category femei --draft true
 *   node find-products.cjs --brand "Steve Madden"
 *   node find-products.cjs --maxPrice 300 --draft false
 *   node find-products.cjs --hasOldPrice true
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = key => {
  const i = args.indexOf(`--${key}`);
  return i !== -1 ? args[i + 1] : null;
};

const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/products.json'), 'utf-8'));

let results = products;

const category = get('category');
if (category) results = results.filter(p => p.category.includes(category));

const brand = get('brand');
if (brand) results = results.filter(p => p.brand.toLowerCase() === brand.toLowerCase());

const draft = get('draft');
if (draft !== null) results = results.filter(p => String(p.draft) === draft);

const maxPrice = get('maxPrice');
if (maxPrice) results = results.filter(p => p.price !== null && p.price <= parseFloat(maxPrice));

const minPrice = get('minPrice');
if (minPrice) results = results.filter(p => p.price !== null && p.price >= parseFloat(minPrice));

const hasOldPrice = get('hasOldPrice');
if (hasOldPrice === 'true') results = results.filter(p => p.old_price && p.old_price > p.price);
if (hasOldPrice === 'false') results = results.filter(p => !p.old_price);

console.log(`\nGăsite: ${results.length} produse\n`);
results.forEach(p => {
  const price = p.price !== null ? `${p.price} RON` : 'fără preț';
  const old = p.old_price ? ` (vechi: ${p.old_price} RON)` : '';
  const status = p.draft ? '[DRAFT]' : '[ACTIV]';
  console.log(`${status} [${p.id}] ${p.brand} — ${p.title}`);
  console.log(`        ${price}${old} | ${p.category.join(', ')}\n`);
});
