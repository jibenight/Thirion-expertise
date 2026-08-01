# Reste à faire — mise en ligne

État au **2026-08-01**. Le code est terminé, commité et poussé sur `origin/main`.
Ce qui reste dépend des comptes Hostinger / GitHub / Keystatic Cloud.

Procédure Keystatic détaillée : [`keystatic-client.md`](keystatic-client.md) §3.

---

## Hébergement retenu : Hostinger, Web App Node.js

Le plan **Business** du client (expire le 2027-06-01) inclut les Web Apps Node.js
avec déploiement automatique depuis GitHub. Le site tourne donc sur un serveur
Node 22, ce qui fait fonctionner d'un seul tenant les trois routes rendues à la
demande : `/keystatic`, `/api/contact` et `/robots.txt`.

L'adaptateur `@astrojs/node` en mode `standalone` produit `dist/server/entry.mjs`,
un serveur autonome qui sert aussi les fichiers statiques de `dist/client`.

> **Historique** : le site a d'abord été déployé sur Cloudflare Workers
> (`thirion-expertise.jean-nguyen.workers.dev`). Cet hébergement est abandonné —
> `@astrojs/cloudflare`, `wrangler` et `wrangler.jsonc` ont été retirés.

## ✅ Déjà fait (code)

- CMS **Keystatic** : contenu éditable dans `src/content/*.yaml`, lu au build.
- Coordonnées centralisées (**Réglages du site**) → header, footer, CTA, contact, mentions.
- Images éditables : diaporama, intervenants, carte, **logo**, **image de partage
  social** (og:image), **bandeaux photo** (Spécialité / Domaine / Contact).
- **Keystatic Cloud** configuré : projet `thirion-david/thirion-expertise`
  (connexion client par e-mail).
- **Adaptateur Node** (`@astrojs/node`, mode `standalone`) + script `npm start`.
- Admin **en français** (`locale: 'fr-FR'` + `scripts/i18n-keystatic.cjs`).
- Édition locale : `npm run dev` → http://localhost:4321/keystatic
- **Formulaire de contact** : endpoint `/api/contact` qui envoie en **SMTP**
  (`nodemailer`) depuis la boîte du domaine — aucun service tiers.
- **Vérifié en local sur Node 22** (`npm run build && npm start`) : `/` servie,
  `/robots.txt` variable selon l'hôte, `/api/contact` exécuté, **`/keystatic`
  répond 200**. C'était le seul maillon jamais testé côté Cloudflare — il est levé.

## ⬜ Reste à faire

1. **hPanel → Sites web → Web Apps → Commencer**, import depuis GitHub
   `jibenight/Thirion-expertise`. Réglages :

   | Champ | Valeur |
   |---|---|
   | Préréglage de framework | Astro |
   | Branche | `main` |
   | Version de Node | `22.x` |
   | Répertoire root | `./` |
   | Commande de compilation | `npm run build` |
   | Gestionnaire de paquets | `npm` |
   | Répertoire de sortie | `dist` |
   | **Fichier d'entrée** | **`dist/server/entry.mjs`** |

2. **Variables d'environnement** (même écran, section *Variables d'environnement*) :

   | Nom | Valeur |
   |---|---|
   | `SMTP_HOST` | `smtp.hostinger.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `david@thirion-expertise.fr` — la **vraie** boîte |
   | `SMTP_PASS` | mot de passe de cette boîte — **secret** |
   | `CONTACT_TO` | `thirionexpertise@gmail.com` |
   | `CONTACT_FROM` | `Thirion Expertise <contact@thirion-expertise.fr>` |

   `SMTP_HOST` et `SMTP_PORT` ont ces valeurs par défaut dans le code : les
   déclarer n'est utile que pour en changer (587 si le 465 pose problème).

3. **Domaine** : `thirion-expertise.fr` est déjà chez Hostinger mais **parqué**
   (NS `lunar/solar.dns-parking.com`, aucun enregistrement A). Le rattacher à la
   Web App depuis hPanel.

4. **Formulaire de contact (SMTP)** :
   - Boîte `david@thirion-expertise.fr` avec l'alias `contact@` (fait).
     Hostinger pose les enregistrements SPF/DKIM du domaine automatiquement.
   - `SMTP_USER` / `SMTP_PASS` = la **boîte réelle** : un alias n'a pas
     d'identifiants. `CONTACT_FROM` affiche l'alias `contact@` ; l'enveloppe SMTP
     part de `SMTP_USER` (`envelope` dans `contact.ts`), les deux adresses étant
     sur le même domaine, SPF et DKIM restent alignés.
   - Dev local : copier `.env.example` en `.env` et y mettre le mot de passe.
   - ⚠️ **À tester une fois en ligne** : que les Web Apps autorisent le SMTP
     sortant. Si le port 465 est bloqué, essayer 587 ; si les deux le sont,
     repli sur une API HTTP type Resend — seul le bloc d'envoi de
     `src/pages/api/contact.ts` change.

5. **keystatic.cloud** → projet `thirion-david/thirion-expertise` → réglages →
   renseigner l'**URL de production** `https://thirion-expertise.fr`
   (autorise la connexion du client depuis cette adresse).

6. **Supprimer le Worker Cloudflare** `thirion-expertise` une fois le site en
   ligne chez Hostinger, pour ne pas laisser traîner une copie publique obsolète.

## ⬜ À vérifier après mise en ligne

7. **Le cycle d'édition complet** : le client va sur `thirion-expertise.fr/keystatic`,
   se connecte **par e-mail**, modifie, **Enregistre** → Keystatic Cloud commite sur
   GitHub → Hostinger redéploie automatiquement → la modification est en ligne.
   C'est ce chaînage qu'il faut tester de bout en bout une fois.

8. **Temps de chargement de l'accueil** : les 14 photos du diaporama pèsent ~5 Mo
   au total (1400 px, qualité 68). Le carrousel ne charge que l'image courante et
   la suivante, mais un mutualisé n'est pas un CDN. Si le premier affichage est
   lent, mettre Cloudflare devant en proxy DNS (cache seul, sans y héberger).

## ℹ️ Notes

- L'écran de **connexion hébergé par Keystatic Cloud** reste en anglais (hors de notre code).
- Les **mentions légales** contiennent des `[À compléter]` (SIRET, forme juridique,
  hébergeur — désormais Hostinger) — à renseigner via l'admin.
- Anciens visuels non référencés à supprimer après validation client :
  `hero-architecture*.jpg`, `hero-villa.jpg`, `hero-immeuble.jpg`,
  `david-thirion-retouched.jpg`, `thierry-thirion-retouched.jpg`.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `keystatic.config.ts` | Schéma éditable + `locale` + storage (local/cloud) |
| `src/content/*.yaml` | Le contenu |
| `src/lib/content.ts` | Lecture du contenu au build (API Reader) |
| `scripts/i18n-keystatic.cjs` | Francisation des libellés (postinstall) |
| `astro.config.mjs` | Adaptateur Node (standalone) + intégrations |
| `package.json` | `npm start` → `node ./dist/server/entry.mjs` |
