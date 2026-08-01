// Hostinger n'accepte qu'un « fichier d'entrée » en `.js`, alors que l'adaptateur
// Node d'Astro produit `dist/server/entry.mjs`. On génère donc à côté un lanceur
// `.js` qui se contente de démarrer le vrai serveur.
//
// `import()` dynamique plutôt qu'un `import` statique : le fichier fonctionne
// ainsi que Node le charge comme ESM ou comme CommonJS, selon qu'un package.json
// `"type": "module"` l'accompagne ou non une fois déployé.
import { writeFile } from 'node:fs/promises';

const LAUNCHER = `import('./entry.mjs').catch((err) => {
  console.error("[thirion-expertise] Le serveur n'a pas pu démarrer :", err);
  process.exit(1);
});
`;

const target = new URL('../dist/server/start.js', import.meta.url);
await writeFile(target, LAUNCHER);
console.log('[hostinger-entry] dist/server/start.js écrit.');
