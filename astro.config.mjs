import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

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
  // Disposition par défaut (`dist/client` + `dist/server`) conservée : Hostinger
  // ne recopie dans le répertoire d'exécution que le répertoire de sortie et les
  // fichiers versionnés. Un bundle serveur écrit ailleurs serait absent au
  // démarrage. `dist/server` étant hors de `dist/client`, il n'est pas non plus
  // exposé par le serveur de fichiers statiques.
  // Le sitemap ne liste que les pages pré-rendues : l'admin et les endpoints,
  // rendus à la demande, en sont exclus d'office. Il est annoncé dans
  // `src/pages/robots.txt.ts`, uniquement sur le domaine canonique.
  integrations: [react(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
