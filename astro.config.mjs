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
  // Les pages publiques sont écrites à la RACINE de `dist/`, et le serveur dans
  // `node-server/`, en dehors. Deux raisons :
  //  1. hPanel monte le répertoire de sortie comme racine web. Avec la
  //     disposition par défaut (`dist/client` + `dist/server`), `dist/` n'a pas
  //     d'`index.html` → 403, et le bundle serveur devient téléchargeable.
  //  2. Ainsi le site reste consultable même si l'hébergeur ne démarre pas le
  //     process Node ; seuls le formulaire et l'admin manqueraient à l'appel.
  // (Ces deux chemins sont résolus depuis `outDir`, pas depuis la racine.)
  build: {
    client: './',
    server: '../node-server',
  },
  // Le sitemap ne liste que les pages pré-rendues : l'admin et les endpoints,
  // rendus à la demande, en sont exclus d'office. Il est annoncé dans
  // `src/pages/robots.txt.ts`, uniquement sur le domaine canonique.
  integrations: [react(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
