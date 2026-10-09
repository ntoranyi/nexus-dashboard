const crypto = require('crypto');

// Reçoit les notifications Cal.com (webhook) quand quelqu'un réserve une démo depuis site.html
// et enregistre le contact dans la table `leads` de Supabase (source = 'demo-site').

module.exports.config = { api: { bodyParser: false } };

const SUPABASE_URL = 'https://pgwwgwchlhmemkitrcxh.supabase.co';
const LEAD_SOURCE = 'demo-site';

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Cal.com signe le corps brut en HMAC SHA-256 (hex) dans l'en-tête X-Cal-Signature-256
function verifyCalSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signatureHeader).trim(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const rawBody = await readRawBody(req);
  const secret = process.env.CAL_WEBHOOK_SECRET;

  if (!secret || !verifyCalSignature(rawBody, req.headers['x-cal-signature-256'], secret)) {
    res.status(400).end('Invalid signature');
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    res.status(400).end('Invalid JSON');
    return;
  }

  // Seules les nouvelles réservations nous intéressent (PING, annulations... : on accuse réception)
  if (event.triggerEvent !== 'BOOKING_CREATED') {
    res.status(200).end('ignored');
    return;
  }

  const attendee = event.payload?.attendees?.[0];
  const email = attendee?.email?.trim().toLowerCase();
  if (!email) {
    res.status(200).end('no attendee');
    return;
  }

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Cal.com peut renvoyer le même événement : on évite les doublons (pas de contrainte unique sur leads.email)
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?select=id&email=eq.${encodeURIComponent(email)}&source=eq.${LEAD_SOURCE}&limit=1`,
      { headers }
    );
    if (!existing.ok) throw new Error(`lookup ${existing.status}`);
    if ((await existing.json()).length > 0) {
      res.status(200).end('duplicate');
      return;
    }

    const insert = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ name: attendee.name || null, email, source: LEAD_SOURCE }),
    });
    if (!insert.ok) throw new Error(`insert ${insert.status}`);
  } catch (err) {
    // 500 => Cal.com réessaiera plus tard
    console.error('cal-webhook:', err.message);
    res.status(500).end('error');
    return;
  }

  res.status(200).end('ok');
};
