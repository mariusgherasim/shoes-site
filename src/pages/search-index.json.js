// Indexul compact pentru căutarea din prima pagină (tot catalogul).
import { produse } from '../data/catalog.mjs';
import { encode, jsonResponse } from '../data/compact.mjs';
export const GET = () => jsonResponse(encode(produse));
