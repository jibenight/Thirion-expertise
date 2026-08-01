// Point d'entrée Node pour Hostinger.
//
// hPanel valide le champ « Fichier d'entrée » sur l'extension `.js` et propose
// en exemple un fichier du dépôt (`src/server.js`). Ce lanceur, versionné et
// donc toujours présent, démarre le serveur produit par `npm run build`.
import { spawnSync } from 'node:child_process';
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

const here = dirname(fileURLToPath(import.meta.url));

// La profondeur varie selon l'hébergeur : certains déposent le contenu du
// répertoire de sortie à plat à côté de ce fichier.
const CANDIDATES = ['dist/server/entry.mjs', 'server/entry.mjs', 'entry.mjs'];
const locate = () => CANDIDATES.find((candidate) => existsSync(join(here, candidate)));

let found = locate();

// Hostinger clone le dépôt et installe les dépendances dans le répertoire
// d'exécution, mais n'y recopie PAS le résultat du build : celui-ci reste dans
// le répertoire de compilation, d'où il part vers la racine web. On compile donc
// ici au premier démarrage — les sources et `node_modules` sont présents, et
// l'opération prend deux à trois secondes.
if (!found) {
  console.log('[thirion-expertise] Build absent du répertoire d’exécution — compilation…');
  const build = spawnSync('npm', ['run', 'build'], { cwd: here, stdio: 'inherit', shell: true });

  if (build.status !== 0) {
    console.error(`[thirion-expertise] La compilation a échoué (code ${build.status}).`);
    process.exit(1);
  }
  found = locate();
}

if (!found) {
  console.error(
    `[thirion-expertise] entry.mjs introuvable après compilation. Cherché : ${CANDIDATES.join(', ')}.\n` +
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
