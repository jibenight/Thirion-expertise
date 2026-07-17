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

Hébergement retenu : **Cloudflare Workers** (build Git automatique via *Workers
Builds*). La configuration du code est **déjà en place** (voir plus bas) ; il
reste les étapes côté comptes GitHub / Cloudflare / Keystatic Cloud.

### Ce qui est déjà configuré dans le projet

- `keystatic.config.ts` — stockage **local en `dev`**, **Keystatic Cloud en
  production** (`storage: import.meta.env.DEV ? local : cloud`), projet
  `thirion-david/thirion-expertise`.
- `astro.config.mjs` — adaptateur `@astrojs/cloudflare` avec
  `prerenderEnvironment: 'node'` (les pages statiques sont pré-rendues en Node,
  seule `/keystatic` tourne comme fonction), admin activé.
- `wrangler.jsonc` — `nodejs_compat` + `compatibility_date` (requis par
  l'admin sur le runtime Cloudflare).

### Étape 1 — Pousser le code sur GitHub

```bash
git push origin main   # dépôt : jibenight/Thirion-expertise
```

### Étape 2 — Créer le projet Keystatic Cloud ✅ (fait)

Projet créé et relié au dépôt : `thirion-david/thirion-expertise`.
Dans les réglages du projet sur **keystatic.cloud**, renseigner l'**URL de
production** du site (`https://thirion-expertise.fr`) pour autoriser la connexion
du client depuis cette adresse.

### Étape 3 — Déployer sur Cloudflare Workers

> ⚠️ L'adaptateur Astro pour Cloudflare déploie sur **Workers**, **plus sur
> Cloudflare Pages**. Utiliser *Workers Builds* (intégration Git).

1. Cloudflare → **Workers & Pages** → **Create** → **Import a repository** →
   sélectionner `jibenight/Thirion-expertise`.
2. **Build command** : `npm run build`.
3. `nodejs_compat` et la `compatibility_date` sont déjà dans `wrangler.jsonc` —
   Cloudflare les applique automatiquement.
4. Le namespace **KV `SESSION`** (utilisé par l'admin) est **auto-provisionné**
   par Wrangler au déploiement — rien à créer à la main.
5. Ajouter le **domaine personnalisé** `thirion-expertise.fr` au Worker.

À chaque `git push` (ou modification enregistrée depuis `/keystatic`), Cloudflare
reconstruit et publie automatiquement.

### Résultat

Le client va sur `https://thirion-expertise.fr/keystatic`, se connecte avec son
**e-mail**, modifie le contenu, clique **Save** → Keystatic Cloud enregistre sur
GitHub → Cloudflare reconstruit et publie — **sans aucune intervention technique**.

> Note : si l'admin rencontrait une limite du runtime edge de Cloudflare, le
> repli est immédiat — remplacer l'adaptateur par `@astrojs/netlify` (runtime
> Node, sans `wrangler.jsonc` ni KV) sans rien changer d'autre.

---

## Fonctionnement technique (pour mémoire)

- `keystatic.config.ts` : définit toutes les rubriques et champs éditables
  (source unique de vérité) ; stockage local en `dev`, Cloud en production.
- `src/lib/content.ts` : lit le contenu au build via l'**API Reader** de
  Keystatic (pages publiques pré-rendues en statique).
- `astro.config.mjs` : adaptateur Cloudflare + admin (`react()` + `keystatic()`) ;
  `output: 'static'` → seules les routes `/keystatic` et `/api/keystatic` sont
  rendues à la demande.
- `wrangler.jsonc` : `nodejs_compat` + `compatibility_date` pour la fonction admin.
