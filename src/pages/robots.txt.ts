import type { APIRoute } from 'astro';

// Route rendue à la demande : le robots.txt dépend du domaine qui sert la page.
export const prerender = false;

// Hôte canonique (doit correspondre à `site` dans astro.config.mjs).
const CANONICAL_HOST = 'thirion-expertise.fr';

// Sur le vrai domaine → indexation autorisée.
// Sur toute autre origine (URL temporaire de l'hébergeur, préviews) → indexation
// interdite, pour éviter que Google référence une URL provisoire (contenu dupliqué).
export const GET: APIRoute = ({ request }) => {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  const isCanonical = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;

  // Le sitemap n'est annoncé que sur le domaine canonique : ailleurs, tout est
  // interdit à l'indexation, l'annoncer n'aurait pas de sens.
  const body = isCanonical
    ? `User-agent: *\nAllow: /\n\nSitemap: https://${CANONICAL_HOST}/sitemap-index.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Le robots.txt varie selon l'hôte : ne pas mutualiser le cache entre domaines.
      'cache-control': 'no-store',
    },
  });
};
