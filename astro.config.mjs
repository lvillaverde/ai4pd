// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH are injected by the deploy workflow (actions/configure-pages).
// Locally they default to a root site so `npm run dev` just works.
// For a custom domain later: set SITE_URL=https://news.example.com and BASE_PATH=/
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
