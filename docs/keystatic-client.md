# Modifier le site avec Keystatic

Le contenu du site (textes, coordonnées, photos, domaines, intervenants…) est
maintenant **éditable via une interface d'administration**, sans toucher au code.

- L'interface s'appelle **Keystatic**, accessible à l'adresse **`/keystatic`**.
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

Dans les champs image (diaporama, photos des intervenants, carte), le bouton
**upload** enregistre le fichier dans `public/images/`. Prévoir des images
déjà optimisées (JPG/PNG, largeur ~1600 px max) pour ne pas alourdir le site.

---

## 3. Activer l'édition en ligne autonome — Keystatic Cloud

**Choix retenu : Keystatic Cloud.** Le client se connecte à `/keystatic` avec un
**simple e-mail** (aucun compte GitHub requis), édite, clique **Save** → Keystatic
Cloud enregistre la modification sur le dépôt → l'hébergeur reconstruit et publie
automatiquement (~1–2 min).

Il y a trois briques à mettre en place **une seule fois**.

### Étape 1 — Le code sur GitHub

Keystatic Cloud enregistre les modifications sur un dépôt **GitHub**. Pousser ce
projet sur un dépôt GitHub (privé de préférence) :

```bash
git remote add origin git@github.com:<organisation>/thirion-expertise.git
git push -u origin main
```

### Étape 2 — Le projet Keystatic Cloud

1. Aller sur **https://keystatic.cloud** et se connecter.
2. Créer une **équipe** (team), puis un **projet** relié au dépôt GitHub ci-dessus.
3. Noter l'identifiant du projet, au format **`equipe/projet`** (fourni sur la
   page de réglages du projet).

### Étape 3 — Adapter la configuration du site

Dans **`keystatic.config.ts`**, remplacer le stockage local par le Cloud :

```ts
export default config({
  storage: { kind: 'cloud' },
  cloud: { project: 'equipe/thirion-expertise' }, // ← identifiant de l'étape 2
  // …le reste (singletons) ne change pas
});
```

Dans **`astro.config.mjs`**, activer l'admin dans le build de production et
ajouter l'**adaptateur de l'hébergeur** (une seule ligne à adapter) :

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify'; // ← ou @astrojs/vercel / @astrojs/cloudflare

export default defineConfig({
  site: 'https://thirion-expertise.fr',
  output: 'static',          // les pages publiques restent pré-rendues (statiques)
  adapter: netlify(),        // seul /keystatic est rendu à la demande
  integrations: [react(), keystatic()],
  vite: { plugins: [tailwindcss()] },
});
```

Installer l'adaptateur correspondant :

| Hébergeur | Commande | Import |
|---|---|---|
| **Netlify** | `npm i @astrojs/netlify` | `import netlify from '@astrojs/netlify'` → `adapter: netlify()` |
| **Vercel** | `npm i @astrojs/vercel` | `import vercel from '@astrojs/vercel'` → `adapter: vercel()` |
| **Cloudflare** | `npm i @astrojs/cloudflare` | `import cloudflare from '@astrojs/cloudflare'` → `adapter: cloudflare()` |

> Avec `output: 'static'` + adaptateur, **seule** la route `/keystatic` est rendue
> à la demande ; toutes les pages publiques restent générées en statique (rapides,
> servies par le CDN).

### Étape 4 — Connecter l'hébergeur au dépôt

Sur Netlify / Vercel / Cloudflare Pages : « New project » → sélectionner le dépôt
GitHub → commande de build `npm run build`. L'hébergeur reconstruit et publie
automatiquement **à chaque modification** enregistrée depuis `/keystatic`.

### Résultat

Le client va sur `https://thirion-expertise.fr/keystatic`, se connecte avec son
e-mail, modifie le contenu, clique **Save** — et le site public se met à jour
tout seul, sans aucune intervention technique.

> **En attendant cette bascule**, le site fonctionne exactement comme avant :
> `npm run build` produit un site **100 % statique**, l'admin Keystatic n'étant
> monté qu'en développement (`npm run dev`).

---

## Fonctionnement technique (pour mémoire)

- `keystatic.config.ts` : définit toutes les rubriques et champs éditables
  (source unique de vérité).
- `src/lib/content.ts` : lit le contenu au build via l'**API Reader** de
  Keystatic ; aucune intégration serveur nécessaire pour le site public.
- `astro.config.mjs` : l'admin (`react()` + `keystatic()`) n'est activé qu'en
  `dev` (`enableAdmin`), afin que le build reste statique.
