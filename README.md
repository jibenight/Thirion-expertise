# THIRION EXPERTISE — Site vitrine

Site vitrine du cabinet **THIRION EXPERTISE**, expertise foncière, immobilière et commerciale, basé à Nîmes. Le site présente les spécialités du cabinet, ses domaines d'intervention, ses intervenants et un moyen de prise de contact.

Site en production : <https://thirion-expertise.fr>

## Stack technique

- **[Astro](https://astro.build/) 7** — génération de site statique
- **[Tailwind CSS](https://tailwindcss.com/) 4** — via le plugin `@tailwindcss/vite`
- **[tw-animate-css](https://www.npmjs.com/package/tw-animate-css)** — utilitaires d'animation
- **[Keystatic](https://keystatic.com/)** — interface d'édition du contenu (voir ci-dessous)
- Composants `.astro`, aucune dépendance front-end lourde ; sortie 100 % statique.

## Gestion du contenu (Keystatic)

Le contenu des pages (textes, coordonnées, photos, domaines, intervenants…) est
éditable via une interface d'administration, **sans toucher au code**, à
l'adresse `/keystatic` (en `npm run dev`). Le contenu est stocké dans
`src/content/*.yaml` et lu au build via l'API Reader de Keystatic — le site
reste 100 % statique.

📖 **Guide complet (édition + passage à l'édition en ligne autonome) :
[`docs/keystatic-client.md`](docs/keystatic-client.md)**

## Prérequis

- **Node.js ≥ 18** (LTS récente recommandée)
- **npm** (fourni avec Node)

## Démarrage

```bash
# installer les dépendances
npm install

# lancer le serveur de développement (http://localhost:4321)
npm run dev

# générer le site statique dans dist/
npm run build

# prévisualiser le build de production en local
npm run preview
```

## Structure du projet

```
thirion-expertise/
├── astro.config.mjs        # config Astro (Tailwind + admin Keystatic en dev)
├── keystatic.config.ts     # rubriques & champs éditables (source unique)
├── public/
│   └── images/             # photos, cartes d'intervention, favicons
├── src/
│   ├── content/            # contenu éditable (YAML, géré par Keystatic)
│   ├── lib/
│   │   └── content.ts       # lecture du contenu au build (API Reader Keystatic)
│   ├── layouts/
│   │   └── Layout.astro     # ossature commune (<head>, header, footer, slot "prefooter")
│   ├── components/
│   │   ├── Header.astro     # en-tête + navigation
│   │   ├── Footer.astro     # pied de page
│   │   ├── Logo.astro
│   │   ├── Icon.astro       # jeu d'icônes SVG (name="…")
│   │   ├── HeroSlider.astro # carrousel du hero (autoplay, flèches, puces, accessible)
│   │   ├── CtaBand.astro    # bandeau d'appel à l'action (prefooter)
│   │   └── PageShell.astro  # gabarit de contenu des pages internes
│   ├── pages/
│   │   ├── index.astro          # Accueil
│   │   ├── specialite.astro     # Spécialité — évaluation & estimation
│   │   ├── domaine.astro        # Domaines d'intervention
│   │   ├── intervenants.astro   # Intervenants (David & Thierry Thirion)
│   │   ├── contact.astro        # Contact
│   │   └── mentions-legales.astro
│   └── styles/
│       └── global.css       # styles globaux + tokens de marque
└── dist/                    # build de sortie (généré, non versionné)
```

## Pages & navigation

| Route | Page | Contenu |
|---|---|---|
| `/` | Accueil | Hero avec carrousel, spécialités, engagements, démarche, zone d'intervention, CTA |
| `/specialite/` | Spécialité | Évaluation et estimation |
| `/domaine/` | Domaine | Domaines d'expertise |
| `/intervenants/` | Intervenants | Présentation des experts |
| `/contact/` | Contact | Coordonnées et prise de rendez-vous |
| `/mentions-legales/` | Mentions légales | Mentions légales |

## Composant HeroSlider

Le carrousel de la page d'accueil (`src/components/HeroSlider.astro`) accepte deux props :

```astro
<HeroSlider slides={heroSlides} interval={4000} />
```

- `slides` : tableau d'objets `{ src, alt }`.
- `interval` : durée de l'auto-défilement en ms (défaut : `6000`).

Il gère le fondu enchaîné, les flèches, les puces, la pause au survol/focus et respecte `prefers-reduced-motion` (pas d'auto-défilement si l'utilisateur réduit les animations).

## Déploiement

`npm run build` produit un site entièrement statique dans `dist/`, déployable sur n'importe quel hébergeur statique (Netlify, Vercel, Cloudflare Pages, serveur web classique…). La propriété `site` de `astro.config.mjs` (`https://thirion-expertise.fr`) est utilisée pour générer les URL absolues.

## Licence

Projet privé — © THIRION EXPERTISE. Tous droits réservés.
