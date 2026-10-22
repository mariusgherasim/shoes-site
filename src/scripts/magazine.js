// Numele afișat al fiecărui magazin partener
export const MAGAZINE = {
  'watchshop.ro': 'WatchShop.ro',
  'ceasuri-shop.ro': 'Ceasuri-Shop.ro',
  'benvenuti.com': 'Benvenuti',
  'otter.ro': 'Otter',
  'gryxx.ro': 'Gryxx',
  'picadili.ro': 'Picadili',
  'menzo.ro': 'Menzo',
  'dyfashion.ro': 'DyFashion',
};
export const magazin = (src) => MAGAZINE[src] || src || '';
