import { config, fields, singleton } from '@keystatic/core';

// Icônes disponibles (voir src/components/Icon.astro) proposées dans l'admin.
const iconOptions = [
  { label: 'Immeuble', value: 'building' },
  { label: 'Maison + mains', value: 'houseHands' },
  { label: 'Maison fissurée', value: 'houseCrack' },
  { label: 'Personnes', value: 'users' },
  { label: 'Badge validé', value: 'badgeCheck' },
  { label: 'Poignée de main', value: 'handshake' },
  { label: 'Coche', value: 'checkCircle' },
  { label: 'Point sur carte', value: 'mapPin' },
];

// Champ image réutilisable : les fichiers sont stockés dans public/images,
// et la valeur enregistrée est du type « /images/mon-fichier.jpg ».
const imageField = (label: string, description?: string) =>
  fields.image({
    label,
    description,
    directory: 'public/images',
    publicPath: '/images/',
  });

export default config({
  // Interface d'administration en français (dictionnaire fr-FR intégré à Keystatic).
  locale: 'fr-FR',
  // En développement : édition des fichiers locaux (src/content).
  // En production : Keystatic Cloud (connexion par e-mail, enregistrement sur GitHub).
  storage: import.meta.env.DEV ? { kind: 'local' } : { kind: 'cloud' },
  cloud: { project: 'thirion-david/thirion-expertise' },
  ui: {
    brand: { name: 'THIRION EXPERTISE' },
    navigation: {
      Contenu: ['accueil', 'specialite', 'domaine', 'intervenants', 'contact', 'mentionsLegales'],
      Configuration: ['parametres'],
    },
  },
  singletons: {
    // ————————————————————————————————————————————————————————
    parametres: singleton({
      label: 'Réglages du site (coordonnées)',
      path: 'src/content/parametres',
      format: { data: 'yaml' },
      schema: {
        telephone: fields.text({
          label: 'Téléphone (affiché)',
          description: 'Ex. 06 95 34 10 70. Le lien « appeler » est généré automatiquement.',
          defaultValue: '06 95 34 10 70',
        }),
        email: fields.text({ label: 'E-mail', defaultValue: 'thirionexpertise@gmail.com' }),
        adresseLigne1: fields.text({ label: 'Adresse — ligne 1', defaultValue: '35 rue des Chassaintes' }),
        adresseLigne2: fields.text({ label: 'Adresse — ligne 2', defaultValue: '30900 NÎMES' }),
        adresseNote: fields.text({ label: 'Adresse — mention', defaultValue: '(sur rendez-vous uniquement)' }),
        linkedin: fields.url({ label: 'URL LinkedIn' }),
        footerTagline: fields.text({
          label: 'Phrase du pied de page',
          multiline: true,
        }),
        logo: imageField(
          'Logo (optionnel)',
          'Remplace le logo monogramme par défaut dans l’en-tête et le pied de page. Laisser vide pour conserver le logo actuel. Format PNG/SVG à fond transparent recommandé.',
        ),
        ogImage: imageField(
          'Image de partage (réseaux sociaux)',
          'Aperçu affiché lors du partage du site (WhatsApp, LinkedIn, Facebook…). Format idéal 1200 × 630 px.',
        ),
      },
    }),

    // ————————————————————————————————————————————————————————
    accueil: singleton({
      label: 'Accueil',
      path: 'src/content/accueil',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO (onglet du navigateur)' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),

        heroTitreLead: fields.text({ label: 'Titre principal — début (en gras)', defaultValue: 'THIRION EXPERTISE' }),
        heroTitreReste: fields.text({ label: 'Titre principal — suite', multiline: true }),
        heroCtaPrimaire: fields.text({ label: 'Bouton 1 (vers Contact)', defaultValue: 'Prendre rendez-vous' }),
        heroCtaSecondaire: fields.text({ label: 'Bouton 2 (vers Spécialité)', defaultValue: 'Nos spécialités' }),
        heroSlides: fields.array(
          fields.object({
            image: imageField('Image'),
            alt: fields.text({ label: 'Texte alternatif (accessibilité/SEO)' }),
          }),
          { label: 'Diaporama (hero)', itemLabel: (p) => p.fields.alt.value || 'Image' },
        ),

        cartes: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icône', options: iconOptions, defaultValue: 'houseHands' }),
            titre: fields.text({ label: 'Titre', multiline: true }),
          }),
          { label: 'Cartes de présentation', itemLabel: (p) => p.fields.titre.value || 'Carte' },
        ),

        pourquoi: fields.array(fields.text({ label: 'Point' }), {
          label: 'Pourquoi choisir THIRION EXPERTISE ?',
          itemLabel: (p) => p.value || 'Point',
        }),
        engagements: fields.array(fields.text({ label: 'Point' }), {
          label: 'Nos engagements',
          itemLabel: (p) => p.value || 'Point',
        }),

        demarche: fields.array(
          fields.object({
            titre: fields.text({ label: 'Titre de l’étape' }),
            texte: fields.text({ label: 'Description', multiline: true }),
          }),
          { label: 'Notre démarche (étapes)', itemLabel: (p) => p.fields.titre.value || 'Étape' },
        ),

        zones: fields.array(
          fields.object({
            titre: fields.text({ label: 'Intitulé' }),
            departements: fields.text({ label: 'Départements', multiline: true }),
          }),
          { label: 'Zone d’intervention', itemLabel: (p) => p.fields.titre.value || 'Zone' },
        ),
        carte: imageField('Carte d’intervention'),
      },
    }),

    // ————————————————————————————————————————————————————————
    specialite: singleton({
      label: 'Spécialité',
      path: 'src/content/specialite',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),
        eyebrow: fields.text({ label: 'Surtitre', defaultValue: 'Spécialité' }),
        titre: fields.text({ label: 'Titre de la page', defaultValue: 'Évaluation et Estimation' }),
        image: imageField('Photo de la page (optionnelle)', 'Affichée en bandeau sous le titre. Laisser vide pour aucune photo.'),
        items: fields.array(
          fields.object({
            icon: fields.select({ label: 'Icône', options: iconOptions, defaultValue: 'building' }),
            titre: fields.text({ label: 'Titre', multiline: true }),
            sousTitre: fields.text({ label: 'Sous-titre', multiline: true }),
            corps: fields.text({ label: 'Texte', multiline: true }),
          }),
          { label: 'Prestations', itemLabel: (p) => p.fields.titre.value || 'Prestation' },
        ),
      },
    }),

    // ————————————————————————————————————————————————————————
    domaine: singleton({
      label: 'Domaine',
      path: 'src/content/domaine',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),
        eyebrow: fields.text({ label: 'Surtitre', defaultValue: 'Domaine' }),
        titre: fields.text({ label: 'Titre de la page', defaultValue: 'Domaine' }),
        image: imageField('Photo de la page (optionnelle)', 'Affichée en bandeau sous le titre. Laisser vide pour aucune photo.'),
        intro: fields.text({ label: 'Phrase d’introduction', multiline: true }),
        items: fields.array(
          fields.object({
            titre: fields.text({ label: 'Titre' }),
            corps: fields.text({ label: 'Texte', multiline: true }),
          }),
          { label: 'Domaines d’intervention', itemLabel: (p) => p.fields.titre.value || 'Domaine' },
        ),
      },
    }),

    // ————————————————————————————————————————————————————————
    intervenants: singleton({
      label: 'Intervenants',
      path: 'src/content/intervenants',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),
        eyebrow: fields.text({ label: 'Surtitre', defaultValue: 'Intervenants' }),
        titre: fields.text({ label: 'Titre de la page', defaultValue: 'Intervenant' }),
        personnes: fields.array(
          fields.object({
            photo: imageField('Photo'),
            nom: fields.text({ label: 'Nom' }),
            roles: fields.array(fields.text({ label: 'Ligne' }), {
              label: 'Qualifications / rôles',
              itemLabel: (p) => p.value || 'Ligne',
            }),
            citation: fields.text({ label: 'Citation', multiline: true }),
          }),
          { label: 'Personnes', itemLabel: (p) => p.fields.nom.value || 'Personne' },
        ),
      },
    }),

    // ————————————————————————————————————————————————————————
    contact: singleton({
      label: 'Contact',
      path: 'src/content/contact',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),
        image: imageField('Photo de la page (optionnelle)', 'Affichée en bandeau sous le titre. Laisser vide pour aucune photo.'),
        introTitre: fields.text({ label: 'Titre d’introduction', defaultValue: 'Prendre rendez-vous ou demander un devis' }),
        introTexte: fields.text({ label: 'Texte d’introduction', multiline: true }),
      },
    }),

    // ————————————————————————————————————————————————————————
    mentionsLegales: singleton({
      label: 'Mentions légales',
      path: 'src/content/mentions-legales',
      format: { data: 'yaml' },
      schema: {
        seoTitle: fields.text({ label: 'Titre SEO' }),
        seoDescription: fields.text({ label: 'Description SEO', multiline: true }),
        editeurComplement: fields.text({ label: 'Éditeur — complément (forme juridique, SIRET…)', multiline: true }),
        directeur: fields.text({ label: 'Directeur de la publication', defaultValue: 'David THIRION.' }),
        hebergement: fields.text({ label: 'Hébergement', multiline: true }),
        proprieteIntellectuelle: fields.text({ label: 'Propriété intellectuelle', multiline: true }),
        donneesPersonnelles: fields.text({ label: 'Données personnelles', multiline: true }),
        cookies: fields.text({ label: 'Cookies', multiline: true }),
      },
    }),
  },
});
