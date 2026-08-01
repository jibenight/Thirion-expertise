// Point d'entrée Node pour Hostinger.
//
// hPanel valide le champ « Fichier d'entrée » sur l'extension `.js` et propose
// en exemple un fichier du dépôt (`src/server.js`), pas un chemin dans le
// dossier de build. Ce lanceur, versionné et donc toujours présent, démarre le
// serveur autonome produit par `npm run build`.
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

// Hostinger recopie le résultat du build à côté de ce fichier, mais la
// profondeur dépend de sa configuration : tantôt `dist/server/`, tantôt le
// contenu du répertoire de sortie déposé à plat. On cherche donc l'entrée parmi
// les emplacements plausibles plutôt que d'en coder un seul en dur.
const here = dirname(fileURLToPath(import.meta.url));
const CANDIDATES = ['dist/server/entry.mjs', 'server/entry.mjs', 'entry.mjs'];

const found = CANDIDATES.find((candidate) => existsSync(join(here, candidate)));

if (!found) {
  console.error(
    `[thirion-expertise] entry.mjs introuvable. Cherché : ${CANDIDATES.join(', ')}.\n` +
      `Contenu de ${here} : ${readdirSync(here).join(', ')}`,
  );
  process.exit(1);
}

console.log(`[thirion-expertise] Serveur trouvé : ${found}`);

// URL absolue plutôt que chemin relatif : `import()` résoudrait le relatif
// depuis ce fichier, ce qui marche, mais l'URL rend l'échec plus lisible.
import(pathToFileURL(join(here, found)).href).catch((err) => {
  console.error("[thirion-expertise] Le serveur n'a pas pu démarrer :", err);
  process.exit(1);
});
