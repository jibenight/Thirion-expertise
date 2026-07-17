import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Les pages publiques restent pré-rendues en statique (`output: 'static'`).
// Seule la route d'administration `/keystatic` est rendue à la demande, servie
// par une fonction Cloudflare Pages via l'adaptateur.
// Le client édite en production via Keystatic Cloud (voir keystatic.config.ts).
export default defineConfig({
  site: 'https://thirion-expertise.fr',
  output: 'static',
  // prerenderEnvironment: 'node' → le prérendu des pages statiques s'exécute en
  // Node (accès à node:path/node:fs pour lire le contenu), pas dans workerd.
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});
