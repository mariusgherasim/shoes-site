import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// GitHub Pages servește paginile ca folder/index.html și redirecționează /ceasuri/2 → /ceasuri/2/ (301).
// Search Console raporta „Pagină cu redirecționare”. După build adăugăm „/” la final în linkurile interne,
// ca să ducă direct la adresa canonică (fișierele .css/.svg/.png/.html și linkurile externe rămân neschimbate).
function trailingSlashLinks() {
  return {
    name: 'trailing-slash-links',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const re = /href="(\/[^"#?]*?[^"#?/])((?:\?[^"#]*)?(?:#[^"]*)?)"/g;
        let files = 0, links = 0;
        const walk = (d) => {
          for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.html')) {
              const src = fs.readFileSync(p, 'utf8');
              const out = src.replace(re, (m, url, rest) => {
                if (url.startsWith('//') || /\.[a-z0-9]{2,5}$/i.test(url)) return m;
                links++;
                return `href="${url}/${rest}"`;
              });
              if (out !== src) { fs.writeFileSync(p, out); files++; }
            }
          }
        };
        walk(root);
        console.log(`[trailing-slash-links] ${links} linkuri interne corectate în ${files} pagini`);
      },
    },
  };
}

export default defineConfig({
  site: 'https://styleaccessories.eu',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    // în sitemap intră doar paginile principale (categorii, branduri, tipuri, oferte);
    // paginile 2, 3, … rămân accesibile și Google le găsește din linkurile de paginare
    sitemap({ filter: (page) => !/\/\d+\/$/.test(page) && !page.includes('/cautare/') }),
    trailingSlashLinks(),
  ],
  vite: { build: { chunkSizeWarningLimit: 4000 } },
});
