/**
 * Fonction Netlify — réception et envoi des demandes de devis.
 *
 * Accessible sur /.netlify/functions/devis (POST JSON).
 * Envoi des emails via l'API Resend (https://resend.com), sans dépendance npm.
 *
 * Variables d'environnement (Netlify > Site configuration > Environment variables) :
 *   RESEND_API_KEY  (obligatoire en production) clé API Resend
 *   DEVIS_TO        destinataire des demandes          (défaut : reflexdemenagement@gmail.com)
 *   DEVIS_FROM      expéditeur, sur un domaine vérifié (défaut : onboarding@resend.dev)
 *
 * Tant que le domaine n'est pas vérifié chez Resend, DEVIS_FROM reste sur onboarding@resend.dev :
 * Resend n'autorise alors l'envoi QU'À l'adresse du compte Resend (=> DEVIS_TO) et l'accusé de
 * réception au client échouera (sans bloquer la demande).
 */

const SERVICE_LABELS = {
  residentiel: 'Déménagement résidentiel',
  entreprise: 'Déménagement professionnel',
  international: 'Déménagement international',
  'garde-meuble': 'Garde-meuble',
  'monte-meuble': 'Location de monte-meuble',
  complementaires: 'Services complémentaires',
  express: 'Déménagement express',
};

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_TIME_MS = 3_000; // un humain met plus de 3 s à remplir le formulaire
const RATE_LIMIT = { windowMs: 10 * 60_000, max: 5 }; // par IP et par instance de fonction

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(0\d{9}|\+\d{8,15})$/;

const hits = new Map();

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const str = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Accepte les requêtes du site lui-même : même origine que la fonction (production, Deploy Previews,
 * `netlify dev`) ou domaines de production. Les variables URL / DEPLOY_PRIME_URL de Netlify n'existent
 * qu'au build, pas à l'exécution des fonctions : on compare donc à l'origine de la requête.
 */
function isAllowedOrigin(origin, requestUrl) {
  if (!origin) return true; // requêtes sans Origin (ex. curl) : filtrées par la validation et l'anti-spam
  if (['https://reflexdemenagement.fr', 'https://www.reflexdemenagement.fr'].includes(origin)) return true;
  try {
    return origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT.max;
}

/** Valide et normalise la demande. Retourne { data } ou { errors }. */
function validate(input) {
  const errors = {};
  const data = {
    prenom: str(input.prenom),
    nom: str(input.nom),
    email: str(input.email).toLowerCase(),
    telephone: str(input.telephone).replace(/[\s.\-()]/g, ''),
    typeService: str(input.typeService),
    datePrevisionnelle: str(input.datePrevisionnelle),
    adresseDepart: str(input.adresseDepart),
    adresseArrivee: str(input.adresseArrivee),
    message: str(input.message),
  };

  for (const field of ['prenom', 'nom']) {
    if (data[field].length < 2 || data[field].length > 50) errors[field] = 'Entre 2 et 50 caractères';
  }
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = 'Adresse email invalide';
  if (!PHONE_RE.test(data.telephone)) errors.telephone = 'Numéro de téléphone invalide';
  if (!Object.hasOwn(SERVICE_LABELS, data.typeService)) errors.typeService = 'Type de service invalide';
  // Location de monte-meuble : une seule adresse (lieu d'intervention)
  const isMonteMeuble = data.typeService === 'monte-meuble';
  if (isMonteMeuble) data.adresseArrivee = '';
  for (const field of isMonteMeuble ? ['adresseDepart'] : ['adresseDepart', 'adresseArrivee']) {
    if (data[field].length < 5 || data[field].length > 200) errors[field] = 'Entre 5 et 200 caractères';
  }
  if (data.message.length > 1000) errors.message = 'Maximum 1000 caractères';
  if (data.datePrevisionnelle) {
    const date = new Date(`${data.datePrevisionnelle}T12:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.datePrevisionnelle) || Number.isNaN(date.getTime())) {
      errors.datePrevisionnelle = 'Date invalide';
    }
  }
  if (input.consentement !== true) errors.consentement = 'Consentement requis';

  return Object.keys(errors).length ? { errors } : { data };
}

function formatDate(isoDate) {
  if (!isoDate) return 'Non précisée';
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildEmails(d) {
  const service = SERVICE_LABELS[d.typeService];
  const fullName = `${d.prenom} ${d.nom}`;
  const rows = [
    ['Nom', fullName],
    ['Email', d.email],
    ['Téléphone', d.telephone],
    ['Service', service],
    ['Date souhaitée', formatDate(d.datePrevisionnelle)],
    ...(d.typeService === 'monte-meuble'
      ? [["Adresse d'intervention", d.adresseDepart]]
      : [
          ['Adresse de départ', d.adresseDepart],
          ["Adresse d'arrivée", d.adresseArrivee],
        ]),
    ['Message', d.message || '—'],
  ];
  const text = rows.map(([k, v]) => `${k} : ${v}`).join('\n');
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 0;color:#0f172a;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join('');
  const wrap = (title, intro) =>
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">` +
    `<h2 style="color:#0f172a;border-bottom:3px solid #E65100;padding-bottom:8px">${title}</h2>` +
    `<p style="color:#334155">${intro}</p><table style="border-collapse:collapse;font-size:14px">${table}</table></div>`;

  return {
    toCompany: {
      subject: `Demande de devis – ${service} – ${fullName}`,
      text: `Nouvelle demande de devis reçue depuis le site.\n\n${text}\n\nRépondre directement à cet email pour contacter le client.`,
      html: wrap(
        'Nouvelle demande de devis',
        'Reçue depuis reflexdemenagement.fr. Répondez directement à cet email pour contacter le client.',
      ),
    },
    toClient: {
      subject: 'Votre demande de devis – Reflex Déménagement',
      text:
        `Bonjour ${d.prenom},\n\nNous avons bien reçu votre demande de devis et revenons vers vous sous 24 h ouvrées.\n\n` +
        `Récapitulatif :\n${text}\n\nPour toute question : 01 70 24 08 60.\n\nL'équipe Reflex Déménagement`,
      html: wrap(
        'Nous avons bien reçu votre demande',
        `Bonjour ${escapeHtml(d.prenom)}, merci pour votre confiance. Nous revenons vers vous sous 24 h ouvrées. ` +
          'Pour toute question : <a href="tel:+33170240860">01 70 24 08 60</a>.',
      ),
    },
  };
}

async function sendEmail({ to, replyTo, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.DEVIS_FROM || 'Reflex Déménagement <onboarding@resend.dev>',
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
}

export default async (req, context) => {
  if (req.method !== 'POST') return json(405, { success: false, message: 'Méthode non autorisée' });
  if (!isAllowedOrigin(req.headers.get('origin'), req.url))
    return json(403, { success: false, message: 'Origine refusée' });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { success: false, message: 'Requête trop volumineuse' });

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json(400, { success: false, message: 'Requête invalide' });
  }
  if (!input || typeof input !== 'object') return json(400, { success: false, message: 'Requête invalide' });

  // Anti-spam : champ piège rempli ou formulaire soumis trop vite => on simule un succès sans rien envoyer.
  const elapsed = Number(input.elapsedMs);
  if (str(input.website) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS) {
    return json(200, { success: true, message: 'Demande reçue' });
  }

  if (isRateLimited(context?.ip ?? 'unknown')) {
    return json(429, {
      success: false,
      message: 'Trop de demandes, réessayez plus tard.',
    });
  }

  const { data, errors } = validate(input);
  if (errors) return json(422, { success: false, message: 'Données invalides', errors });

  const emails = buildEmails(data);

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NETLIFY_DEV === 'true') {
      console.log('[devis] RESEND_API_KEY absente — email simulé :\n' + emails.toCompany.text);
      return json(200, {
        success: true,
        message: 'Demande reçue (simulation locale)',
      });
    }
    console.error('[devis] RESEND_API_KEY manquante : impossible d’envoyer la demande');
    return json(503, {
      success: false,
      message: 'Service temporairement indisponible',
    });
  }

  try {
    await sendEmail({
      to: process.env.DEVIS_TO || 'reflexdemenagement@gmail.com',
      replyTo: data.email,
      ...emails.toCompany,
    });
  } catch (error) {
    console.error('[devis] échec envoi entreprise :', error.message); // pas de données personnelles dans les logs
    return json(502, { success: false, message: "L'envoi a échoué" });
  }

  try {
    await sendEmail({ to: data.email, ...emails.toClient });
  } catch (error) {
    console.warn('[devis] accusé de réception non envoyé :', error.message);
  }

  return json(200, { success: true, message: 'Demande envoyée' });
};
