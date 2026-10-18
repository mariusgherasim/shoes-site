// Toate produsele cu reducere, pentru pagina /oferte/ cu filtre.
import { oferte } from '../data/catalog.mjs';
import { encode, jsonResponse } from '../data/compact.mjs';
export const GET = () => jsonResponse(encode(oferte));
