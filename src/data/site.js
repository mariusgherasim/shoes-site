// ============================================================
// SETĂRI GENERALE — styleaccessories.eu
// Un singur loc pentru domeniu, analytics, newsletter, Trustpilot.
// ============================================================

export const SITE = {
  domeniu: 'https://styleaccessories.eu',
  nume: 'style.accessories',
  numeLung: 'Style Accessories',
  descriere:
    'Ceasuri, ochelari, bijuterii, încălțăminte, haine și genți de la 7 magazine online, cu prețurile și reducerile actualizate.',
  email: 'office@gherasimmarius.com',
};

// Google Analytics 4 — aceeași proprietate ca toate site-urile (filtrezi după hostname)
export const GA_ID = 'G-HS59YL4Y3D';

// MailerLite — formularul grupului STYLE (singurul grup pentru acest site)
export const MAILERLITE = {
  cont: '1999265',
  formId: '194310241415857526', // formularul STYLE
  embedId: '44253038',          // numărul din id="mlb2-…" al formularului
};

// Trustpilot — după ce ai codul widgetului TrustBox pentru styleaccessories.eu,
// completezi businessUnitId și token (le găsești în codul primit de la Trustpilot:
// data-businessunit-id="…" și data-token="…"). Până atunci, stickerul afișează
// un link simplu către pagina de recenzii.
export const TRUSTPILOT = {
  businessUnitId: '6ad4bbc3dea7b17b7f05cfb1',
  token: '3a58bcb2-2165-4359-b9f0-72861cfe6fbe',
  templateId: '56278e9abfbbba0bdcd568bc', // Review Collector (același ca la beauty)
  link: 'https://www.trustpilot.com/review/styleaccessories.eu',
};

// Paginare
export const PE_PAGINA = 24;

// Comercianții (pentru texte, footer, pagini legale)
export const COMERCIANTI = [
  'watchshop.ro', 'ceasuri-shop.ro', 'benvenuti.com', 'otter.ro', 'gryxx.ro', 'picadili.ro', 'menzo.ro',
];
