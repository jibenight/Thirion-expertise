// Point d'entrée Node pour Hostinger.
//
// hPanel valide le champ « Fichier d'entrée » sur l'extension `.js` et propose
// en exemple un fichier du dépôt (`src/server.js`). Ce lanceur, versionné et
// donc toujours présent, démarre le serveur produit par `npm run build`.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
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
/** Page d'attente servie pendant la compilation, rafraîchie toute seule. */
const HOLDING_PAGE = `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="5"><title>Démarrage…</title>
<body style="font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#1a3a7e">
<p>Le site démarre. Cette page se rafraîchit automatiquement.</p></body></html>`;

/**
 * Ouvre le port immédiatement avec une page d'attente.
 *
 * La plateforme tue le process s'il n'écoute pas au bout de trois secondes
 * environ (la compilation échouait alors avec un code `null`, signe d'un
 * signal). On réserve donc le port avant de compiler, et on le rend ensuite.
 */
function holdPort() {
  const server = createServer((_req, res) => {
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '10',
    });
    res.end(HOLDING_PAGE);
  });
  return new Promise((resolve) => {
    server.listen(Number(process.env.PORT), () => resolve(server));
  });
}

function runBuild(astroCli) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [astroCli, 'build'], { cwd: here, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`code ${code}, signal ${signal}`)),
    );
  });
}

if (!found) {
  // On invoque le CLI d'Astro avec le binaire Node courant, sans passer par
  // `npm` : celui-ci n'est pas dans le PATH du runtime Hostinger (code 127).
  const astroCli = join(here, 'node_modules', 'astro', 'bin', 'astro.mjs');
  if (!existsSync(astroCli)) {
    console.error(`[thirion-expertise] CLI Astro introuvable : ${astroCli}`);
    process.exit(1);
  }

  const placeholder = await holdPort();
  console.log('[thirion-expertise] Port réservé — compilation…');

  try {
    await runBuild(astroCli);
  } catch (err) {
    console.error(`[thirion-expertise] La compilation a échoué (${err.message}).`);
    process.exit(1);
  }

  found = locate();

  // Libérer le port avant de passer la main au vrai serveur.
  placeholder.closeAllConnections?.();
  await new Promise((resolve) => placeholder.close(resolve));
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
