import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// Les pages publiques restent pré-rendues en statique (`output: 'static'`).
// Seules les routes marquées `prerender = false` sont rendues à la demande :
// l'admin `/keystatic`, l'endpoint `/api/contact` et `/robots.txt`.
// Le client édite en production via Keystatic Cloud (voir keystatic.config.ts).
//
// Hébergement : Cloudflare Workers. Une tentative de bascule vers les Web Apps
// Node de Hostinger a été abandonnée — leur runtime (LiteSpeed `lsnode`) impose
// une série de contraintes non documentées : préréglage Astro purement statique,
// build absent du répertoire d'exécution, `npm` hors du PATH, process tué au
// bout de trois secondes s'il n'écoute pas, point d'entrée chargé en `require()`.
//
// L'adaptateur Cloudflare n'est branché que pour le BUILD : en dev, Astro sert
// l'admin via Vite/Node (plus rapide, et sans le runtime workerd qui casse
// l'optimiseur de dépendances de Vite avec Keystatic).
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://thirion-expertise.fr',
  output: 'static',
  // prerenderEnvironment: 'node' → le prérendu des pages statiques s'exécute en
  // Node (accès à node:path/node:fs pour lire le contenu), pas dans workerd.
  ...(isDev ? {} : { adapter: cloudflare({ prerenderEnvironment: 'node' }) }),
  // Le sitemap ne liste que les pages pré-rendues : l'admin et les endpoints,
  // rendus à la demande, en sont exclus d'office. Il est annoncé dans
  // `src/pages/robots.txt.ts`, uniquement sur le domaine canonique.
  integrations: [react(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
