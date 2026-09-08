const crypto = require('crypto');

module.exports.config = { api: { bodyParser: false } };

const SUPABASE_URL = 'https://pgwwgwchlhmemkitrcxh.supabase.co';

// Grille tarifaire — doit rester synchronisée avec CLAUDE.md et les 4 pages HTML
const PLAN_BY_AMOUNT = { 2700: 'starter', 6700: 'pro', 14700: 'agency' };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, signatureHeader, secret, toleranceSeconds = 300) {
  if (!signatureHeader) return false;
  const items = signatureHeader.split(',').map((p) => p.split('='));
  const timestamp = items.find(([k]) => k === 't')?.[1];
  const signatures = items.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');

  const isValid = signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, 'utf8');
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
  if (!isValid) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  return ageSeconds <= toleranceSeconds;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }

  const rawBody = await readRawBody(req);
  const signatureHeader = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !verifyStripeSignature(rawBody.toString('utf8'), signatureHeader, webhookSecret)) {
    res.status(400).end('Invalid signature');
    return;
  }

  const event = JSON.parse(rawBody.toString('utf8'));

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;
    const plan = PLAN_BY_AMOUNT[session.amount_total];

    if (email && plan) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ plan }),
      });
    }
  }

  res.status(200).end('ok');
};
