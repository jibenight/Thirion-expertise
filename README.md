# THIRION EXPERTISE — Site vitrine

Site vitrine du cabinet **THIRION EXPERTISE**, évaluation et estimation de tous biens et droits immobiliers et commerciaux, basé à Nîmes. Le site présente les spécialités du cabinet, ses domaines d'intervention, ses intervenants, et un formulaire de prise de contact.

Site en production : <https://thirion-expertise.fr>

## Stack technique

- **[Astro](https://astro.build/) 7** — pages publiques pré-rendues (`output: 'static'`)
- **[@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)** — adaptateur pour les routes rendues à la demande, branché au build uniquement
- **[Tailwind CSS](https://tailwindcss.com/) 4** — via le plugin `@tailwindcss/vite`
- **[Keystatic](https://keystatic.com/)** — interface d'édition du contenu (voir ci-dessous), qui amène `@astrojs/react`
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** — sitemap généré au build
- Composants `.astro`, aucune dépendance front-end lourde. L'envoi d'e-mail se fait par un simple `fetch` — pas de client SMTP.

### Ce qui est statique, ce qui ne l'est pas

Les six pages publiques sont pré-rendues au build et servies comme fichiers. Seules **quatre routes** s'exécutent dans le Worker, marquées `prerender = false` :

| Route | Rôle |
|---|---|
| `/keystatic` + `/api/keystatic` | l'interface d'administration |
| `/api/contact` | envoi du formulaire via Resend |
| `/robots.txt` | dépend du domaine appelant (voir SEO) |

## Gestion du contenu (Keystatic)

Le contenu des pages (textes, coordonnées, photos, domaines, intervenants…) est éditable via une interface d'administration, **sans toucher au code**, à l'adresse `/keystatic`. Le contenu vit dans `src/content/*.yaml` et est lu au build via l'API Reader de Keystatic.

En développement le stockage est **local** (les fichiers YAML sont modifiés sur place) ; en production il passe par **Keystatic Cloud**, ce qui permet au client de se connecter avec son e-mail, sans compte GitHub. Ses enregistrements sont commités sur le dépôt, ce qui déclenche un redéploiement.

📖 **Guide complet : [`docs/keystatic-client.md`](docs/keystatic-client.md)**

## Prérequis

- **Node.js ≥ 20** (22 recommandé, c'est la version utilisée en CI)
- **npm** (fourni avec Node)

## Démarrage

```bash
npm install          # installe les dépendances
npm run dev          # serveur de développement — http://localhost:4321
npm run build        # build de production dans dist/

npm run preview      # aperçu du build sur le vrai runtime workerd
```

> `npm run preview` exécute le Worker compilé dans **workerd**, le même moteur qu'en production — c'est le seul moyen de tester `/keystatic`, `/api/contact` et `/robots.txt` dans les conditions réelles. Il faut donc avoir lancé `npm run build` avant.

### Formulaire de contact en local

Copier `.env.example` en `.env` et renseigner la clé Resend. Sans elle, `/api/contact` répond 500 avec un message explicite plutôt que d'échouer silencieusement.

En `npm run dev`, les variables viennent de `.env`. En `npm run preview`, on est dans workerd : ce sont les conventions wrangler qui s'appliquent, donc un fichier `.dev.vars` (git-ignoré, même format).

## Structure du projet

```
thirion-expertise/
├── astro.config.mjs        # adaptateur Cloudflare (build only) + intégrations
├── wrangler.jsonc          # nodejs_compat, domaines personnalisés, variables non secrètes
├── keystatic.config.ts     # rubriques & champs éditables (source unique)
├── scripts/
│   └── i18n-keystatic.cjs  # francise les libellés de l'admin (postinstall)
├── docs/                   # guide client Keystatic + fiche de mise en ligne
├── public/
│   └── images/             # photos, carte d'intervention, favicons
├── src/
│   ├── content/            # contenu éditable (YAML, géré par Keystatic)
│   ├── lib/
│   │   └── content.ts      # lecture du contenu au build (API Reader Keystatic)
│   ├── layouts/
│   │   └── Layout.astro    # <head> (SEO, canonical, og), header, footer, slot "prefooter"
│   ├── components/
│   │   ├── Header.astro    # en-tête, navigation, menu mobile
│   │   ├── Footer.astro
│   │   ├── Logo.astro
│   │   ├── Icon.astro      # jeu d'icônes SVG (name="…")
│   │   ├── HeroSlider.astro
│   │   ├── CtaBand.astro   # bandeau d'appel à l'action (prefooter)
│   │   └── PageShell.astro # gabarit des pages internes
│   ├── pages/
│   │   ├── index.astro          # Accueil
│   │   ├── specialite.astro     # Spécialité
│   │   ├── domaine.astro        # Domaines d'intervention
│   │   ├── intervenants.astro   # David & Thierry Thirion
│   │   ├── contact.astro        # Contact
│   │   ├── mentions-legales.astro
│   │   ├── robots.txt.ts        # robots.txt variable selon l'hôte (SSR)
│   │   └── api/contact.ts       # endpoint du formulaire (SSR)
│   └── styles/
│       └── global.css      # styles globaux + tokens de marque
└── dist/                   # build (non versionné) : client/ = statique, server/ = Worker
```

## Pages & navigation

| Route | Page | Contenu |
|---|---|---|
| `/` | Accueil | Hero avec carrousel, spécialités, engagements, démarche, zone d'intervention, CTA |
| `/specialite/` | Spécialité | Prestations d'évaluation et d'estimation |
| `/domaine/` | Domaine | Domaines d'intervention |
| `/intervenants/` | Intervenants | Présentation des experts |
| `/contact/` | Contact | Coordonnées et formulaire |
| `/mentions-legales/` | Mentions légales | — |

## Formulaire de contact

`POST /api/contact` accepte du JSON ou un `FormData` et renvoie `{ ok: true }` ou `{ ok: false, error }`.

L'envoi passe par l'**API HTTP de Resend** plutôt que par SMTP : un appel HTTPS sur le port 443 passe partout, là où les ports SMTP sortants sont souvent bloqués en hébergement mutualisé. Le `Reply-To` est l'adresse du visiteur, pour que le bouton « Répondre » écrive directement à lui. Un champ piège invisible (`company`) absorbe les bots : s'il est rempli, l'endpoint répond `{ ok: true }` sans rien envoyer.

| Variable | Rôle |
|---|---|
| `RESEND_API_KEY` | clé API — **secret** (`npx wrangler secret put RESEND_API_KEY`) |
| `CONTACT_TO` | destinataire des demandes |
| `CONTACT_FROM` | expéditeur affiché, sur un domaine vérifié chez Resend |

`CONTACT_TO` et `CONTACT_FROM` sont déclarés dans `wrangler.jsonc` ; seule la clé est un secret.

## SEO

- **Sitemap** généré au build (`/sitemap-index.xml`), listant les seules pages pré-rendues — l'admin et les endpoints en sont exclus d'office.
- **`robots.txt` variable selon l'hôte** : `Allow: /` et déclaration du sitemap sur `thirion-expertise.fr`, `Disallow: /` partout ailleurs. Une URL de prévisualisation ne peut donc pas être indexée par accident.
- **`rel=canonical` et `og:url`** construits sur `site` : le contenu étant servi à l'identique sur l'apex et sur `www`, la balise désigne toujours la version sans `www`.

## Composant HeroSlider

```astro
<HeroSlider slides={heroSlides} interval={4000} />
```

- `slides` : tableau d'objets `{ src, alt }`.
- `interval` : durée de l'auto-défilement en ms (défaut : `6000`).

Fondu enchaîné, flèches, puces, pause au survol et au focus, et respect de `prefers-reduced-motion` (pas d'auto-défilement si l'utilisateur réduit les animations).

Les visuels sont **chargés à la demande** : seules l'image courante et la suivante sont téléchargées. Avec la quinzaine de photos du diaporama, tout charger d'emblée représenterait plusieurs mégaoctets sur la page d'accueil.

## Déploiement

`npm run build` produit les pages pré-rendues dans `dist/client/` et le Worker dans `dist/server/`.

L'hébergement est **Cloudflare Workers**, avec build et déploiement automatiques depuis GitHub (*Workers Builds*) : chaque push sur `main` — y compris ceux que Keystatic Cloud génère quand le client enregistre — reconstruit et publie le site.

Les domaines servis (`thirion-expertise.fr` et `www.`) sont déclarés en `routes` dans `wrangler.jsonc` plutôt qu'ajoutés à la main dans le dashboard : ils sont ainsi versionnés et réappliqués à chaque déploiement.

Déploiement manuel si besoin :

```bash
npm run build && npx wrangler deploy
```

**Le DNS est géré par Cloudflare, la messagerie reste chez Hostinger.** Toute manipulation de la zone doit préserver les MX, le SPF, le DMARC, les trois DKIM `hostingermail-*` et les CNAME `autodiscover`/`autoconfig` — sans quoi la messagerie du client tombe. Les enregistrements d'envoi Resend vivent sur le sous-domaine `send.`, pour ne pas entrer en conflit avec le SPF de la racine.

📖 **Fiche de mise en ligne et points restants : [`docs/deploiement-reste-a-faire.md`](docs/deploiement-reste-a-faire.md)**

## Licence

Projet privé — © THIRION EXPERTISE. Tous droits réservés.
