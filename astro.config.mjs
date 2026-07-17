import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Les pages publiques restent pré-rendues en statique (`output: 'static'`).
// Seule la route d'administration `/keystatic` est rendue à la demande, servie
// par une fonction Cloudflare via l'adaptateur (en production).
// Le client édite en production via Keystatic Cloud (voir keystatic.config.ts).
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
  integrations: [react(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
  },
});
