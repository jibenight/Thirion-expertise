// Point d'entrée Node pour Hostinger.
//
// hPanel valide le champ « Fichier d'entrée » sur l'extension `.js` et propose
// en exemple un fichier du dépôt (`src/server.js`), pas un chemin dans le
// dossier de build. Ce lanceur, versionné et donc toujours présent, démarre le
// serveur autonome produit par `npm run build` dans `node-server/`.
//
// `import()` dynamique plutôt qu'un `import` statique : le fichier reste valide
// que Node le charge comme ESM ou comme CommonJS.
import('./node-server/entry.mjs').catch((err) => {
  console.error("[thirion-expertise] Le serveur n'a pas pu démarrer :", err);
  process.exit(1);
});
