# Reste à faire — mise en ligne de l'édition autonome

État au **2026-07-18**. Toute la partie **code est terminée, commitée et poussée**
sur `origin/main` (dernier commit `284d4c7`). Ce qui reste dépend des comptes
GitHub / Cloudflare / Keystatic Cloud.

Procédure détaillée : [`keystatic-client.md`](keystatic-client.md) §3.

---

## ✅ Déjà fait (code)

- CMS **Keystatic** : contenu éditable dans `src/content/*.yaml`, lu au build.
- Coordonnées centralisées (**Réglages du site**) → header, footer, CTA, contact, mentions.
- Images éditables : diaporama, intervenants, carte, **logo**, **image de partage
  social** (og:image), **bandeaux photo** (Spécialité / Domaine / Contact).
- **Keystatic Cloud** configuré : projet `thirion-david/thirion-expertise`
  (connexion client par e-mail).
- **Cloudflare Workers** : adaptateur `@astrojs/cloudflare` (branché au build
  seulement), `wrangler.jsonc` avec `nodejs_compat`.
- Admin **en français** (`locale: 'fr-FR'` + `scripts/i18n-keystatic.cjs`).
- Édition locale : `npm run dev` → http://localhost:4321/keystatic
- **Formulaire de contact** connecté : endpoint serveur `/api/contact` (Worker)
  qui envoie la demande par email via **Resend** (fini le `mailto:`).

## ⬜ Reste à faire (toi)

1. **keystatic.cloud** → projet `thirion-david/thirion-expertise` → réglages →
   renseigner l'**URL de production** `https://thirion-expertise.fr`
   (autorise la connexion du client depuis cette adresse).

2. **Cloudflare** → Workers & Pages → **Create → Import a repository** →
   `jibenight/Thirion-expertise`.
   - ⚠️ C'est **Workers**, pas *Pages* (l'adaptateur ne déploie plus sur Pages).
   - Build command : `npm run build`
   - `nodejs_compat` + `compatibility_date` déjà dans `wrangler.jsonc` (auto).
   - Le KV `SESSION` est auto-provisionné.

3. Ajouter le **domaine** `thirion-expertise.fr` au Worker.

4. **Formulaire de contact (Resend)** :
   - Créer un compte sur **resend.com** (gratuit, 3 000 mails/mois).
   - **Vérifier le domaine** `thirion-expertise.fr` → coller les enregistrements
     DNS fournis (SPF/DKIM) dans le DNS Cloudflare. Sans ça, l'envoi depuis
     `contact@thirion-expertise.fr` est refusé.
   - Créer une **clé API** puis la poser en secret :
     `npx wrangler secret put RESEND_API_KEY`.
   - `CONTACT_TO` / `CONTACT_FROM` sont déjà dans `wrangler.jsonc`.
   - Dev local : copier `.env.example` en `.env` et y mettre la clé.

## ⬜ À vérifier après mise en ligne

4. **`/keystatic` se charge en prod** — c'est le seul maillon non testé (runtime
   edge Cloudflare + Keystatic). Si l'admin plante à l'exécution → **repli
   immédiat** : dans `astro.config.mjs`, remplacer `@astrojs/cloudflare` par
   `@astrojs/netlify` (`npm i @astrojs/netlify`, `adapter: netlify()`), supprimer
   `wrangler.jsonc`, déployer sur Netlify. Runtime Node, sans KV.

5. Connexion client : aller sur `thirion-expertise.fr/keystatic`, se connecter
   **par e-mail**, modifier, **Enregistrer** → publication auto (~1-2 min).

## ⚠️ Point de vigilance

6. **Comment `thirion-expertise.fr` est-il déployé aujourd'hui ?**
   Le build sort désormais `dist/client/` + `dist/server/` (au lieu d'un site « à
   plat » dans `dist/`). Si un déploiement automatique est déjà branché sur ce
   dépôt, il risque de servir le mauvais dossier → à vérifier / basculer sur
   Cloudflare.

## ℹ️ Notes

- L'écran de **connexion hébergé par Keystatic Cloud** reste en anglais (hors de notre code).
- Les **mentions légales** contiennent des `[À compléter]` (SIRET, forme juridique,
  hébergeur) — à renseigner via l'admin quand les infos seront connues.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `keystatic.config.ts` | Schéma éditable + `locale` + storage (local/cloud) |
| `src/content/*.yaml` | Le contenu |
| `src/lib/content.ts` | Lecture du contenu au build (API Reader) |
| `scripts/i18n-keystatic.cjs` | Francisation des libellés (postinstall) |
| `astro.config.mjs` | Adaptateur Cloudflare (build only) + intégrations |
| `wrangler.jsonc` | `nodejs_compat` pour la fonction admin |
