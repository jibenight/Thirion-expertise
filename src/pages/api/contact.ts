import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Route rendue à la demande (exécutée par le serveur Node, pas prérendue).
export const prerender = false;

// Destination par défaut si CONTACT_TO n'est pas défini (repli sur l'email du cabinet).
const DEFAULT_TO = 'thirionexpertise@gmail.com';
// Expéditeur par défaut : la boîte du domaine, hébergée chez Hostinger.
const DEFAULT_FROM = 'Thirion Expertise <contact@thirion-expertise.fr>';
// SMTP Hostinger par défaut ; 465 = TLS implicite (587 = STARTTLS si besoin).
const DEFAULT_SMTP_HOST = 'smtp.hostinger.com';
const DEFAULT_SMTP_PORT = '465';

/**
 * Lit une variable d'environnement :
 * - en développement via `import.meta.env` (fichier `.env`) ;
 * - en production via `process.env` (variables déclarées dans hPanel).
 */
function getEnv(key: string): string | undefined {
  return import.meta.env[key] ?? process.env[key];
}

// Le transporteur ouvre un pool de connexions : on le garde pour la durée de vie
// du process plutôt que d'en recréer un à chaque demande de contact.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');
  if (!user || !pass) return null;

  const port = Number(getEnv('SMTP_PORT') ?? DEFAULT_SMTP_PORT);
  transporter = nodemailer.createTransport({
    host: getEnv('SMTP_HOST') ?? DEFAULT_SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
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

export const POST: APIRoute = async ({ request }) => {
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

  const mailer = getTransporter();
  if (!mailer) {
    console.error('SMTP_USER / SMTP_PASS manquants.');
    return json({ ok: false, error: "Le service d'envoi n'est pas configuré." }, 500);
  }

  const to = getEnv('CONTACT_TO') ?? DEFAULT_TO;
  const from = getEnv('CONTACT_FROM') ?? DEFAULT_FROM;

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
    await mailer.sendMail({
      from,
      to,
      // Répondre au message écrit directement au visiteur, pas à la boîte du site.
      replyTo: email,
      subject: `[Contact site] ${subject}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Échec de l'envoi SMTP :", err);
    return json({ ok: false, error: "L'envoi a échoué, réessayez plus tard." }, 502);
  }

  return json({ ok: true });
};
