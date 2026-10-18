// Produsele unei categorii, pentru căutarea din pagina de categorie.
import { categorii } from '../../data/categorii.js';
import { produseCategorie } from '../../data/catalog.mjs';
import { encode, jsonResponse } from '../../data/compact.mjs';
export const getStaticPaths = () => categorii.map((c) => ({ params: { slug: c.slug } }));
export const GET = ({ params }) => jsonResponse(encode(produseCategorie(params.slug)));
