import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

// Les pages publiques restent pré-rendues en statique (`output: 'static'`).
// Seules les routes marquées `prerender = false` sont rendues à la demande :
// l'admin `/keystatic`, l'endpoint `/api/contact` et `/robots.txt`.
// Le client édite en production via Keystatic Cloud (voir keystatic.config.ts).
//
// Hébergement : Web App Node.js chez Hostinger (Node 22, déploiement GitHub).
// Le mode `standalone` produit `dist/server/entry.mjs`, un serveur autonome qui
// sert aussi les fichiers statiques de `dist/client` — c'est le « fichier
// d'entrée » à renseigner dans hPanel. Il écoute sur $PORT / $HOST.

export default defineConfig({
  site: 'https://thirion-expertise.fr',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});
