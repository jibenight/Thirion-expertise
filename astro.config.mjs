import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// L'admin Keystatic (routes rendues à la volée) n'est monté qu'en développement,
// pour que `npm run build` reste 100 % statique (déploiement actuel inchangé).
// Le contenu, lui, est lu au build via l'API Reader (aucune intégration requise).
// → Pour activer l'édition en production, voir docs/keystatic-client.md.
const enableAdmin = process.argv.includes('dev');

export default defineConfig({
  site: 'https://thirion-expertise.fr',
  integrations: enableAdmin ? [react(), keystatic()] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
