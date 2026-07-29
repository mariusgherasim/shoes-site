import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://style.gherasimmarius.com',
  integrations: [sitemap()],
  output: 'static',
});
