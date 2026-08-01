# Reste à faire — mise en ligne

État au **2026-08-02**. Le code est terminé, commité et poussé sur `origin/main`.
Ce qui reste dépend des comptes Cloudflare / GitHub / Keystatic Cloud / Resend.

Procédure Keystatic détaillée : [`keystatic-client.md`](keystatic-client.md) §3.

---

## Hébergement : Cloudflare Workers

Les pages publiques sont pré-rendues (`output: 'static'`) ; trois routes sont
rendues à la demande par le Worker : l'admin `/keystatic`, l'endpoint
`/api/contact` et `/robots.txt`.

> **Tentative Hostinger abandonnée (nuit du 1ᵉʳ au 2 août).** Le plan Business du
> client inclut des Web Apps Node, mais leur runtime — LiteSpeed `lsnode` —
> impose une série de contraintes non documentées, découvertes une par une :
> préréglage « Astro » purement statique qui ne démarre jamais Node ; champ
> « fichier d'entrée » refusant les `.mjs` ; résultat du build absent du
> répertoire d'exécution ; `npm` hors du `PATH` ; process tué au bout de trois
> secondes s'il n'écoute pas ; point d'entrée chargé en `require()`, donc
> incompatible avec un `await` de premier niveau. Huit déploiements, aucun
> succès. Hostinger reste l'hébergeur du **domaine** et de la **messagerie**.

## ✅ Déjà fait (code)

- CMS **Keystatic** : contenu éditable dans `src/content/*.yaml`, lu au build.
- Coordonnées centralisées (**Réglages du site**) → header, footer, CTA, contact, mentions.
- Images éditables : diaporama, intervenants, carte, **logo**, **image de partage
  social** (og:image), **bandeaux photo** (Spécialité / Domaine / Contact).
- **Keystatic Cloud** configuré : projet `thirion-david/thirion-expertise`
  (connexion client par e-mail).
- **Adaptateur Cloudflare** (`@astrojs/cloudflare`) + `wrangler.jsonc`
  (`nodejs_compat`).
- Admin **en français** (`locale: 'fr-FR'` + `scripts/i18n-keystatic.cjs`).
- Édition locale : `npm run dev` → http://localhost:4321/keystatic
- **Formulaire de contact** : `/api/contact` envoie via l'**API HTTP de Resend**
  (un simple `fetch`, aucune dépendance — et HTTPS passe là où le SMTP sortant
  est souvent bloqué).
- **Sitemap** (`@astrojs/sitemap`), annoncé dans le `robots.txt` sur le seul
  domaine canonique.
- ✅ **`/keystatic` vérifié sur workerd** (`wrangler dev --local`) : répond 200.
  C'était le seul maillon jamais testé du projet — le repli Netlify n'a plus
  lieu d'être.

## ⬜ Reste à faire

1. **Compte Cloudflare du client** — s'authentifier en local :

   ```bash
   npx wrangler login          # OAuth navigateur, rien à stocker
   ```

2. **Brancher le dépôt** : Cloudflare → **Workers & Pages** → **Create** →
   **Import a repository** → `jibenight/Thirion-expertise`.
   - ⚠️ C'est **Workers**, pas *Pages* (l'adaptateur ne déploie plus sur Pages).
   - Build command : `npm run build`
   - `nodejs_compat` et `compatibility_date` sont déjà dans `wrangler.jsonc`.
   - Le KV `SESSION` est auto-provisionné.

   > Sans cette intégration Git, **rien ne se déploie au push** — c'est le piège
   > dans lequel le projet est tombé en juillet : le Worker était déployé à la
   > main par `wrangler deploy`, et trois jours de commits n'étaient jamais
   > partis en ligne. À défaut d'intégration, `npx wrangler deploy` après chaque
   > modification.

3. **Formulaire de contact (Resend)** :
   - Compte sur **resend.com** (gratuit, 3 000 mails/mois).
   - **Vérifier le domaine** `thirion-expertise.fr` → coller les enregistrements
     SPF/DKIM fournis **dans le DNS qui fait autorité** (voir étape 4). Sans ça,
     l'envoi depuis `contact@thirion-expertise.fr` est refusé. La vérification
     porte sur le domaine : que `contact@` soit un alias de `david@` ne gêne pas.
   - Poser la clé en secret : `npx wrangler secret put RESEND_API_KEY`.
   - `CONTACT_TO` / `CONTACT_FROM` sont déjà dans `wrangler.jsonc`.
   - Dev local : copier `.env.example` en `.env` et y mettre la clé.

4. **Domaine `thirion-expertise.fr`** — aujourd'hui chez Hostinger, parqué
   (NS `lunar/solar.dns-parking.com`).

   > ⚠️ **Relever les enregistrements MX, SPF et DKIM avant toute manipulation.**
   > La boîte `david@thirion-expertise.fr` et son alias `contact@` sont hébergés
   > chez Hostinger : attacher un domaine à un Worker exige de basculer les
   > nameservers vers Cloudflare, et les MX doivent être recréés à l'identique
   > côté Cloudflare, sinon la messagerie du client tombe.

   Puis ajouter le domaine personnalisé au Worker.

5. **keystatic.cloud** → projet `thirion-david/thirion-expertise` → réglages →
   renseigner l'**URL de production** `https://thirion-expertise.fr`
   (autorise la connexion du client depuis cette adresse).

6. **Nettoyer chez Hostinger** : supprimer la Web App Node, qui sert encore une
   copie statique du site sur le domaine. Conserver le domaine et la messagerie.

## ⬜ À vérifier après mise en ligne

7. **Un vrai envoi depuis le formulaire**, pour confirmer la configuration Resend
   de bout en bout.

8. **Le cycle d'édition complet** : le client va sur `thirion-expertise.fr/keystatic`,
   se connecte **par e-mail**, modifie, **Enregistre** → Keystatic Cloud commite sur
   GitHub → Cloudflare redéploie → la modification est en ligne. C'est ce
   chaînage qu'il faut tester une fois de bout en bout.

9. **Déclarer le sitemap** dans la Google Search Console :
   `https://thirion-expertise.fr/sitemap-index.xml`.

## ℹ️ Notes

- L'écran de **connexion hébergé par Keystatic Cloud** reste en anglais (hors de notre code).
- Les **mentions légales** contiennent des `[À compléter]` (SIRET, forme juridique,
  hébergeur) — à renseigner via l'admin.
- Anciens visuels non référencés à supprimer après validation client :
  `hero-architecture*.jpg`, `hero-villa.jpg`, `hero-immeuble.jpg`,
  `david-thirion-retouched.jpg`, `thierry-thirion-retouched.jpg`.
- Les 14 photos du diaporama pèsent ~5 Mo (1400 px, qualité 68). Le carrousel ne
  charge que l'image courante et la suivante.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `keystatic.config.ts` | Schéma éditable + `locale` + storage (local/cloud) |
| `src/content/*.yaml` | Le contenu |
| `src/lib/content.ts` | Lecture du contenu au build (API Reader) |
| `scripts/i18n-keystatic.cjs` | Francisation des libellés (postinstall) |
| `astro.config.mjs` | Adaptateur Cloudflare (build only) + intégrations |
| `wrangler.jsonc` | `nodejs_compat` + variables non secrètes |
