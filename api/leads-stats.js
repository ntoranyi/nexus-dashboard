// GET /api/leads-stats — agrégats sur public.leads, sans aucune donnée personnelle.
// Auth : jeton Supabase de l'utilisateur connecté (Authorization: Bearer <access_token>)
// + liste blanche d'e-mails (LEADS_STATS_ADMIN_EMAILS). La clé service reste côté serveur.

const TZ = 'Europe/Paris';
const PAGE_SIZE = 1000;

function json(res, status, body) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(status).json(body);
}

// "2026-10" pour une date, dans le fuseau Europe/Paris
function monthKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' })
    .formatToParts(date);
  return `${parts.find((p) => p.type === 'year').value}-${parts.find((p) => p.type === 'month').value}`;
}

async function getUser(supabaseUrl, serviceKey, token) {
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

// Ne sélectionne que source + created_at : ni nom, ni e-mail, ni entreprise, ni LinkedIn.
async function fetchAllLeads(supabaseUrl, serviceKey) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const r = await fetch(`${supabaseUrl}/rest/v1/leads?select=source,created_at&order=created_at.asc`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!r.ok) throw new Error(`Supabase leads query failed (${r.status})`);
    const page = await r.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'method_not_allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admins = (process.env.LEADS_STATS_ADMIN_EMAILS || '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!supabaseUrl || !serviceKey || admins.length === 0) {
    return json(res, 500, { error: 'server_not_configured' });
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(res, 401, { error: 'unauthenticated' });

  try {
    const user = await getUser(supabaseUrl, serviceKey, token);
    if (!user) return json(res, 401, { error: 'unauthenticated' });
    if (!admins.includes((user.email || '').toLowerCase())) return json(res, 403, { error: 'forbidden' });

    const leads = await fetchAllLeads(supabaseUrl, serviceKey);
    const now = new Date();
    const currentMonth = monthKey(now);
    const since30 = now.getTime() - 30 * 24 * 3600 * 1000;

    let thisMonth = 0;
    let last30Days = 0;
    let lastLeadAt = null;
    const bySource = {};
    for (const { source, created_at: createdAt } of leads) {
      const key = source || 'Inconnue';
      bySource[key] = (bySource[key] || 0) + 1;
      if (!createdAt) continue;
      const d = new Date(createdAt);
      if (monthKey(d) === currentMonth) thisMonth++;
      if (d.getTime() >= since30) last30Days++;
      if (!lastLeadAt || d > new Date(lastLeadAt)) lastLeadAt = createdAt;
    }

    return json(res, 200, { total: leads.length, thisMonth, last30Days, bySource, lastLeadAt });
  } catch (e) {
    console.error('leads-stats error:', e.message);
    return json(res, 502, { error: 'upstream_error' });
  }
};
