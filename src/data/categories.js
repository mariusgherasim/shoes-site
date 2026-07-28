// Categorii manuale (tag în products.json)
export const MANUAL_CATEGORIES = [
  {
    slug: 'femei',
    label: 'Femei',
    title: 'Pantofi & Încălțăminte Femei',
    description: 'Colecție completă de încălțăminte pentru femei — sneakers, pantofi eleganți, sandale și multe altele.',
    metaTitle: 'Pantofi Femei | style.gherasimmarius.com',
    metaDescription: 'Descoperă colecția de pantofi și încălțăminte pentru femei — Steve Madden, Guess, Tommy Hilfiger, Calvin Klein și alte branduri premium.',
  },
  {
    slug: 'barbati',
    label: 'Bărbați',
    title: 'Pantofi & Încălțăminte Bărbați',
    description: 'Colecție de încălțăminte pentru bărbați — derby, sneakers, mocasini și loaferi din piele naturală.',
    metaTitle: 'Pantofi Bărbați | style.gherasimmarius.com',
    metaDescription: 'Pantofi și încălțăminte pentru bărbați — Benvenuti, Luca di Gioia, Enzo Bertini, Premiata. Piele naturală, livrare rapidă.',
  },
  {
    slug: 'copii',
    label: 'Copii',
    title: 'Încălțăminte Copii',
    description: 'Pantofi și sneakers pentru copii — confortabili, durabili, de la branduri de calitate.',
    metaTitle: 'Pantofi Copii | style.gherasimmarius.com',
    metaDescription: 'Încălțăminte pentru copii — modele confortabile și durabile din piele naturală și materiale premium.',
  },
  {
    slug: 'noutati',
    label: 'Noutăți',
    title: 'Modele Noi',
    description: 'Cele mai recente adăugiri în colecție.',
    metaTitle: 'Noutăți | style.gherasimmarius.com',
    metaDescription: 'Cele mai noi modele de pantofi și încălțăminte adăugate în colecție.',
  },
];

// Colecții automate (calculate din date, fără tag manual)
export const AUTO_COLLECTIONS = [
  {
    slug: 'oferte',
    label: 'Oferte',
    title: 'Oferte & Reduceri',
    description: 'Toate produsele cu reducere activă — prețul curent față de prețul original.',
    metaTitle: 'Oferte Pantofi | style.gherasimmarius.com',
    metaDescription: 'Pantofi și încălțăminte cu reduceri — branduri premium la prețuri mai mici.',
    filter: (p) => p.old_price && p.old_price > p.price,
  },
  {
    slug: 'sub-300-lei',
    label: 'Sub 300 Lei',
    title: 'Încălțăminte sub 300 Lei',
    description: 'Modele accesibile din colecție, sub 300 Lei.',
    metaTitle: 'Pantofi sub 300 Lei | style.gherasimmarius.com',
    metaDescription: 'Pantofi și încălțăminte de calitate sub 300 Lei.',
    filter: (p) => p.price <= 300,
  },
];

export const ALL_SLUGS = [
  ...MANUAL_CATEGORIES.map(c => c.slug),
  ...AUTO_COLLECTIONS.map(c => c.slug),
];
