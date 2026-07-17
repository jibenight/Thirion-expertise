#!/usr/bin/env node
/**
 * Francise les libellés de l'admin Keystatic qui sont codés en dur dans les
 * bundles (donc NON couverts par l'option `locale: 'fr-FR'` de keystatic.config.ts).
 *
 * Exécuté automatiquement en `postinstall`. Conçu pour être :
 *  - robuste : cherche les chaînes dans tous les fichiers dist/*.js (insensible
 *    au hash des noms de fichiers) ;
 *  - non bloquant : si une chaîne n'existe plus (mise à jour de Keystatic), elle
 *    est simplement ignorée, avec un avertissement — l'installation n'échoue pas ;
 *  - idempotent : réappliqué sans effet une fois les libellés déjà en français.
 *
 * Ne concerne PAS l'éditeur de texte riche ni le mode GitHub (non utilisés ici).
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'node_modules', '@keystatic', 'core', 'dist');

// [chaîne anglaise exacte, remplacement français]
const PAIRS = [
  // Bouton principal d'enregistrement (formulaire singleton)
  ['isCreating ? "Create" : "Save"', 'isCreating ? "Créer" : "Enregistrer"'],
  // Tableaux (diaporama, cartes, domaines, intervenants…)
  ['"Add item"', '"Ajouter un élément"'],
  ['"Add the first item to see it here."', '"Ajoutez le premier élément pour le voir ici."'],
  ['"Edit item"', '"Modifier l\'élément"'],
  ['"Empty list"', '"Liste vide"'],
  ['["Add", " ",', '["Ajouter", " ",'],
  ['children: "Add"', 'children: "Ajouter"'],
  ['"aria-label": "Add"', '"aria-label": "Ajouter"'],
  ['props.href ? "Edit" : "Add"', 'props.href ? "Modifier" : "Ajouter"'],
  ['children: "Edit"', 'children: "Modifier"'],
  ['"Remove"', '"Retirer"'],
  ['"Done"', '"Terminé"'],
  // Champs image
  ['"Choose file"', '"Choisir un fichier"'],
  ['"Image details"', '"Détails de l\'image"'],
  ['children: "Download"', 'children: "Télécharger"'],
  ['children: "Regenerate"', 'children: "Régénérer"'],
  // Connexion / compte (Keystatic Cloud)
  ['"Log in with Keystatic Cloud"', '"Se connecter avec Keystatic Cloud"'],
  ['"Sign into Cloud"', '"Se connecter au Cloud"'],
  ['"Manage Account"', '"Gérer le compte"'],
  // Navigation / états
  ['"Dashboard"', '"Tableau de bord"'],
  ['"Unsaved"', '"Non enregistré"'],
  ['"Changed"', '"Modifié"'],
  ['"Contains invalid fields. Please edit."', '"Contient des champs invalides. Veuillez corriger."'],
  ['"Entry not found."', '"Entrée introuvable."'],
];

if (!fs.existsSync(DIST)) {
  // @keystatic/core pas (encore) installé — rien à faire.
  process.exit(0);
}

const files = fs.readdirSync(DIST).filter((f) => f.endsWith('.js'));
const applied = {};
let total = 0;

for (const file of files) {
  const full = path.join(DIST, file);
  let content = fs.readFileSync(full, 'utf8');
  let changed = false;
  for (const [en, fr] of PAIRS) {
    if (content.includes(en)) {
      const count = content.split(en).length - 1;
      content = content.split(en).join(fr);
      applied[en] = (applied[en] || 0) + count;
      total += count;
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(full, content, 'utf8');
}

const missing = PAIRS.filter(([en]) => !(en in applied)).map(([en]) => en);
if (total > 0) {
  console.log(`[i18n-keystatic] ${total} libellé(s) francisé(s).`);
}
if (missing.length && total > 0) {
  // Uniquement informatif : certaines chaînes n'existent plus (MàJ Keystatic).
  console.warn(`[i18n-keystatic] ${missing.length} chaîne(s) non trouvée(s) (ignorées) : ${missing.slice(0, 5).join(' | ')}${missing.length > 5 ? '…' : ''}`);
}
