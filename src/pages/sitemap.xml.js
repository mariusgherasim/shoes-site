import products from '../data/products.json';

export async function GET() {
  const base = 'https://style.gherasimmarius.com';
  const categories = ['femei', 'barbati', 'copii', 'oferte', 'noutati', 'sub-300-lei'];
  
  const active = products.filter(p => !p.draft && p.availability);
  const perPage = 24;

  let urls = [
    `${base}/`,
    `${base}/confidentialitate`,
    `${base}/termeni`,
  ];

  for (const cat of categories) {
    const count = cat === 'oferte'
      ? active.filter(p => p.old_price && p.old_price > p.price).length
      : cat === 'sub-300-lei'
      ? active.filter(p => p.price <= 300).length
      : active.filter(p => p.category.includes(cat)).length;
    
    const pages = Math.max(1, Math.ceil(count / perPage));
    for (let i = 1; i <= pages; i++) {
      urls.push(`${base}/${cat}/${i}`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
