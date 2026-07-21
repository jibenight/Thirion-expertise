import type { APIRoute } from 'astro';

// Route rendue à la demande (exécutée sur le Worker Cloudflare, pas prérendue).
export const prerender = false;

// Destination par défaut si CONTACT_TO n'est pas défini (repli sur l'email du cabinet).
const DEFAULT_TO = 'thirionexpertise@gmail.com';
// Expéditeur par défaut : doit appartenir à un domaine vérifié dans Resend.
const DEFAULT_FROM = 'Thirion Expertise <contact@thirion-expertise.fr>';

/**
 * Lit une variable d'environnement :
 * - en production Cloudflare via `locals.runtime.env` (secrets Wrangler) ;
 * - en développement via `import.meta.env` / `process.env` (fichier .env).
 */
function getEnv(locals: App.Locals, key: string): string | undefined {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  return runtimeEnv?.[key] ?? import.meta.env[key] ?? (globalThis as any).process?.env?.[key];
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

export const POST: APIRoute = async ({ request, locals }) => {
  let payload: Record<string, string>;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      payload = Object.fromEntries((await request.formData()) as unknown as Iterable<[string, string]>);
    }
  } catch {
    return json({ ok: false, error: 'Requête invalide.' }, 400);
  }

  // Anti-spam : champ piège invisible. Un bot le remplit, un humain non.
  if (payload.company) return json({ ok: true });

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const phone = (payload.phone ?? '').trim();
  const subject = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (!name || !email || !subject || !message) {
    return json({ ok: false, error: 'Merci de remplir tous les champs obligatoires.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Adresse email invalide.' }, 400);
  }

  const apiKey = getEnv(locals, 'RESEND_API_KEY');
  if (!apiKey) {
    console.error('RESEND_API_KEY manquant.');
    return json({ ok: false, error: "Le service d'envoi n'est pas configuré." }, 500);
  }

  const to = getEnv(locals, 'CONTACT_TO') ?? DEFAULT_TO;
  const from = getEnv(locals, 'CONTACT_FROM') ?? DEFAULT_FROM;

  const text =
    `Nom : ${name}\n` +
    `Téléphone : ${phone || '—'}\n` +
    `Email : ${email}\n\n` +
    `${message}\n`;
  const html =
    `<p><strong>Nom :</strong> ${escapeHtml(name)}</p>` +
    `<p><strong>Téléphone :</strong> ${escapeHtml(phone || '—')}</p>` +
    `<p><strong>Email :</strong> ${escapeHtml(email)}</p>` +
    `<hr /><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Contact site] ${subject}`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Échec Resend :', res.status, detail);
      return json({ ok: false, error: "L'envoi a échoué, réessayez plus tard." }, 502);
    }
  } catch (err) {
    console.error('Erreur réseau Resend :', err);
    return json({ ok: false, error: "L'envoi a échoué, réessayez plus tard." }, 502);
  }

  return json({ ok: true });
};
