import products from '../data/products.json';

export async function GET() {
  const index = products
    .filter(p => !p.draft && p.availability)
    .map(p => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      price: p.price,
      old_price: p.old_price,
      image_url: p.image_url,
      affiliate_url: p.affiliate_url,
    }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
