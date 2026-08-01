// Point d'entrée Node pour Hostinger.
//
// hPanel valide le champ « Fichier d'entrée » sur l'extension `.js` et propose
// en exemple un fichier du dépôt (`src/server.js`), pas un chemin dans le
// dossier de build. Ce lanceur, versionné et donc toujours présent, démarre le
// serveur autonome produit par `npm run build` dans `node-server/`.

// L'hébergeur impose normalement le port via $PORT. S'il ne le fait pas, on se
// rabat sur 3000 — la convention que sondent la plupart des plateformes — plutôt
// que sur le 4321 d'Astro, qu'aucun proxy ne va chercher.
process.env.PORT ??= '3000';

// HOST est laissé tel quel volontairement : sans valeur, Node écoute sur toutes
// les interfaces (IPv4 et IPv6). Forcer 0.0.0.0 couperait un proxy qui passerait
// par ::1.
console.log(
  `[thirion-expertise] Démarrage — port ${process.env.PORT}` +
    `, host ${process.env.HOST ?? '(toutes interfaces)'}` +
    `, Node ${process.version}`,
);

// `import()` dynamique plutôt qu'un `import` statique : le fichier reste valide
// que Node le charge comme ESM ou comme CommonJS.
import('./node-server/entry.mjs').catch((err) => {
  console.error("[thirion-expertise] Le serveur n'a pas pu démarrer :", err);
  process.exit(1);
});
