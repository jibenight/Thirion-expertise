# Modifier le site avec Keystatic

Le contenu du site (textes, coordonnées, photos, domaines, intervenants…) est
maintenant **éditable via une interface d'administration**, sans toucher au code.

- L'interface s'appelle **Keystatic**, accessible à l'adresse **`/keystatic`**,
  **en français** (libellés des champs + interface de l'admin).
- Les modifications sont enregistrées dans des fichiers de contenu
  (`src/content/*.yaml`) puis publiées via un **build** du site.
- Le site reste **100 % statique** : rapide, sûr, sans base de données.

---

## 1. Où se trouve le contenu

| Écran dans Keystatic | Fichier | Pages concernées |
|---|---|---|
| **Réglages du site** | `src/content/parametres.yaml` | Téléphone, e-mail, adresse, LinkedIn — utilisés dans l'en-tête, le pied de page, le bandeau de contact, les pages Contact et Mentions légales |
| **Accueil** | `src/content/accueil.yaml` | Page d'accueil (titre, diaporama, cartes, engagements, démarche, zones, carte) |
| **Spécialité** | `src/content/specialite.yaml` | Page Spécialité |
| **Domaine** | `src/content/domaine.yaml` | Page Domaine |
| **Intervenants** | `src/content/intervenants.yaml` | Page Intervenants (photos, rôles, citations) |
| **Contact** | `src/content/contact.yaml` | Textes d'introduction de la page Contact (+ bandeau d'appel à l'action) |
| **Mentions légales** | `src/content/mentions-legales.yaml` | Page Mentions légales |

> **Astuce** — Modifier le téléphone ou l'e-mail dans **Réglages du site** met à
> jour **tout le site** d'un coup (en-tête, pied de page, contact, mentions).

Les **titres de sections** de la page d'accueil (« Nos engagements », « Notre
démarche », « Zone d'intervention »…) restent fixes ; seul leur **contenu** est
éditable. C'est volontaire, pour préserver la mise en page.

---

## 2. Modifier le contenu aujourd'hui (mode local)

Tant que l'édition en ligne n'est pas activée (voir §3), les modifications se
font sur le poste du développeur :

```bash
npm install       # une seule fois
npm run dev        # démarre le site en local
```

Puis ouvrir **http://localhost:4321/keystatic** dans le navigateur.

1. Choisir une rubrique dans le menu de gauche.
2. Modifier les textes / images.
3. Cliquer sur **Save** : le fichier de contenu est mis à jour automatiquement.
4. Publier les changements :

```bash
git add src/content
git commit -m "Mise à jour du contenu"
git push
npm run build      # génère le site à jour dans dist/
```

Le contenu de `dist/` est ensuite déployé chez l'hébergeur (comme aujourd'hui).

### Images

Toutes les images ci-dessous sont **modifiables et ajoutables** via le bouton
**upload** de l'admin (le fichier est enregistré dans `public/images/`) :

| Image | Où la modifier |
|---|---|
| Diaporama d'accueil (ajout/suppression/réordre) | **Accueil** |
| Photos des intervenants (+ nouvel intervenant) | **Intervenants** |
| Carte d'intervention | **Accueil** |
| **Logo** (en-tête + pied de page) | **Réglages du site** — vide = logo monogramme par défaut |
| **Image de partage social** (aperçu WhatsApp / LinkedIn / Facebook) | **Réglages du site** |
| **Photo de bandeau** (optionnelle) sur Spécialité / Domaine / Contact | page concernée |

> Prévoir des images déjà optimisées (JPG/PNG, largeur ~1600 px max, ~1200 × 630
> px pour l'image de partage social) pour ne pas alourdir le site.

---

## 3. Activer l'édition en ligne autonome — Keystatic Cloud

**Choix retenu : Keystatic Cloud.** Le client se connecte à `/keystatic` avec un
**simple e-mail** (aucun compte GitHub requis), édite, clique **Save** → Keystatic
Cloud enregistre la modification sur le dépôt → l'hébergeur reconstruit et publie
automatiquement (~1–2 min).

Hébergement retenu : **Web App Node.js chez Hostinger** (build Git automatique
depuis GitHub). La configuration du code est **déjà en place** (voir plus bas) ;
il reste les étapes côté comptes GitHub / Hostinger / Keystatic Cloud.

### Ce qui est déjà configuré dans le projet

- `keystatic.config.ts` — stockage **local en `dev`**, **Keystatic Cloud en
  production** (`storage: import.meta.env.DEV ? local : cloud`), projet
  `thirion-david/thirion-expertise`.
- `astro.config.mjs` — adaptateur `@astrojs/node` en mode `standalone` : les
  pages publiques restent pré-rendues, seules `/keystatic`, `/api/contact` et
  `/robots.txt` sont rendues à la demande. Admin activé.
- `package.json` — `npm start` → `node ./dist/server/entry.mjs`, le serveur
  autonome produit par le build (c'est le « fichier d'entrée » attendu par hPanel).

### Étape 1 — Pousser le code sur GitHub

```bash
git push origin main   # dépôt : jibenight/Thirion-expertise
```

### Étape 2 — Créer le projet Keystatic Cloud ✅ (fait)

Projet créé et relié au dépôt : `thirion-david/thirion-expertise`.
Dans les réglages du projet sur **keystatic.cloud**, renseigner l'**URL de
production** du site (`https://thirion-expertise.fr`) pour autoriser la connexion
du client depuis cette adresse.

### Étape 3 — Déployer la Web App Hostinger

hPanel → **Sites web → Web Apps → Commencer** → import depuis GitHub
`jibenight/Thirion-expertise`.

| Champ | Valeur |
|---|---|
| Préréglage de framework | Astro |
| Branche | `main` |
| Version de Node | `22.x` |
| Répertoire root | `./` |
| Commande de compilation | `npm run build` |
| Répertoire de sortie | `dist` |
| **Fichier d'entrée** | **`dist/server/entry.mjs`** |

Ajouter dans la même page les variables d'environnement `RESEND_API_KEY`,
`CONTACT_TO` et `CONTACT_FROM` (formulaire de contact), puis rattacher le domaine
`thirion-expertise.fr` — il est chez Hostinger mais encore parqué.

À chaque `git push` (ou modification enregistrée depuis `/keystatic`), Hostinger
reconstruit et publie automatiquement.

### Résultat

Le client va sur `https://thirion-expertise.fr/keystatic`, se connecte avec son
**e-mail**, modifie le contenu, clique **Save** → Keystatic Cloud enregistre sur
GitHub → Hostinger reconstruit et publie — **sans aucune intervention technique**.

> L'admin a été vérifiée en local sur Node 22 (`npm run build && npm start`) :
> `/keystatic` répond 200. Le doute qui pesait sur le runtime edge de Cloudflare
> n'a plus lieu d'être avec un runtime Node.

---

## Fonctionnement technique (pour mémoire)

- `keystatic.config.ts` : définit toutes les rubriques et champs éditables
  (source unique de vérité) ; stockage local en `dev`, Cloud en production.
- `src/lib/content.ts` : lit le contenu au build via l'**API Reader** de
  Keystatic (pages publiques pré-rendues en statique).
- `astro.config.mjs` : adaptateur Node + admin (`react()` + `keystatic()`) ;
  `output: 'static'` → seules les routes marquées `prerender = false` sont
  rendues à la demande (`/keystatic`, `/api/keystatic`, `/api/contact`,
  `/robots.txt`).

### Interface d'administration en français

- `keystatic.config.ts` : option **`locale: 'fr-FR'`** → active le dictionnaire
  français intégré à Keystatic (Annuler, Ajouter, Supprimer, Modifier, Rechercher,
  sélecteurs de date…).
- `scripts/i18n-keystatic.cjs` (exécuté en **`postinstall`**) : francise les
  quelques libellés codés en dur dans Keystatic et non couverts par la locale
  (bouton **Enregistrer**, gestion des tableaux et des images, connexion Cloud).
  Robuste (insensible au hash des bundles), non bloquant et idempotent.

> Limite : l'écran de connexion **hébergé** par Keystatic Cloud reste en anglais
> (hors de notre code).
