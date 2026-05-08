import type { DailyAction, Product, AdScript, ChatResponse } from '../types';

export type { DailyAction, Product, AdScript, ChatResponse };

// Use VITE_API_URL env var if defined (e.g. https://your-backend.onrender.com),
// otherwise fall back to relative /api path (works with Vite dev proxy & same-origin deploys).
const RAW_BASE = (import.meta.env?.VITE_API_URL as string | undefined) ?? '/api';
const API_BASE = RAW_BASE.replace(/\/$/, ''); // strip trailing slash

// Detect if we're in "offline / no backend" mode. We'll dynamically flip this
// flag the first time a real fetch fails, so further calls short-circuit to mocks.
let backendAvailable: boolean | null = null;

const FETCH_TIMEOUT_MS = 6000;

async function safeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  // If we already know backend is down, return fallback immediately.
  if (backendAvailable === false && fallback !== undefined) {
    return fallback;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    backendAvailable = true;
    return data;
  } catch (err) {
    backendAvailable = false;
    if (fallback !== undefined) {
      console.warn(`[api] backend unreachable for ${path}, using offline fallback`);
      return fallback;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- OFFLINE MOCK DATA ----------
const mockActions: DailyAction[] = [
  {
    id: '1',
    action_type: 'scale',
    title: 'Scaler Mini Imprimante Photo',
    description: 'ROAS 4.2 sur TikTok Ads — augmenter le budget de 30% sur les audiences gagnantes.',
    priority: 'high',
    product_name: 'Mini Imprimante Photo',
    recommended_budget: 250,
  },
  {
    id: '2',
    action_type: 'test',
    title: 'Tester nouveau hook Projecteur Galaxie',
    description: 'Créer 3 variations UGC avec hook "POV: ta chambre devient un ciel étoilé" pour Reels.',
    priority: 'medium',
    product_name: 'Projecteur Galaxie',
    recommended_budget: 80,
  },
  {
    id: '3',
    action_type: 'optimize',
    title: 'Optimiser landing page Bouteille Intelligente',
    description: 'Taux conversion 1.8% — ajouter avis clients + section "Comment ça marche" pour viser 3%+.',
    priority: 'high',
    product_name: 'Bouteille Eau Intelligente',
    recommended_budget: null,
  },
  {
    id: '4',
    action_type: 'kill',
    title: 'Couper campagne Lampe LED',
    description: 'CPA $42 vs cible $18 — désactiver et réallouer le budget vers les winners.',
    priority: 'high',
    product_name: 'Lampe LED Sunset',
    recommended_budget: null,
  },
  {
    id: '5',
    action_type: 'content',
    title: 'Filmer 5 nouvelles vidéos UGC',
    description: 'Variantes hooks Mini Imprimante : unboxing, démo enfant, cadeau Saint-Valentin.',
    priority: 'medium',
    product_name: 'Mini Imprimante Photo',
    recommended_budget: 0,
  },
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Mini Imprimante Photo',
    category: 'Electronics',
    price: 39.99,
    cost: 8.5,
    viral_score: 92,
    profit_score: 83,
    competition_score: 65,
    total_score: 73,
    source: 'Minea',
    views: 2400000,
    engagement: 8.4,
    market_saturation: 'medium',
    potential_regions: ['FR', 'US', 'CA', 'BE'],
    trending_since: '2026-04-12',
  },
  {
    id: 'p2',
    name: 'Projecteur Galaxie',
    category: 'Home',
    price: 49.99,
    cost: 12.0,
    viral_score: 88,
    profit_score: 79,
    competition_score: 72,
    total_score: 71,
    source: 'Kalodata',
    views: 1800000,
    engagement: 7.2,
    market_saturation: 'high',
    potential_regions: ['FR', 'DE', 'IT'],
    trending_since: '2026-03-28',
  },
  {
    id: 'p3',
    name: 'Bouteille Eau Intelligente',
    category: 'Sports',
    price: 34.9,
    cost: 9.2,
    viral_score: 81,
    profit_score: 84,
    competition_score: 58,
    total_score: 70,
    source: 'PipiAds',
    views: 950000,
    engagement: 6.8,
    market_saturation: 'low',
    potential_regions: ['FR', 'ES', 'PT'],
    trending_since: '2026-04-22',
  },
  {
    id: 'p4',
    name: 'Lampe LED Sunset',
    category: 'Home',
    price: 24.99,
    cost: 5.4,
    viral_score: 76,
    profit_score: 88,
    competition_score: 81,
    total_score: 67,
    source: 'TikTok',
    views: 3200000,
    engagement: 9.1,
    market_saturation: 'high',
    potential_regions: ['FR', 'US', 'UK'],
    trending_since: '2026-02-15',
  },
];

function mockAdScript(args: { product_name: string; concept_type: string; platform: string }): AdScript {
  return {
    id: `mock-${Date.now()}`,
    product_id: 'mock',
    concept_type: args.concept_type,
    hook: `🚨 STOP — Tu ne croiras pas ce que ${args.product_name} peut faire en 3 secondes...`,
    script: [
      `[0-3s] HOOK : Plan serré sur ${args.product_name} en action, regard caméra surpris.`,
      `[3-8s] PROBLÈME : "Tu en as marre de [problème typique du client] ?"`,
      `[8-18s] SOLUTION : Démonstration produit avec voix off enthousiaste + texte à l'écran.`,
      `[18-25s] PREUVE SOCIALE : 3 témoignages clients en split-screen.`,
      `[25-30s] CTA : "Clique sur le lien en bio — stock limité ⚡"`,
    ].join('\n'),
    voiceover: `Et si je te disais que ${args.product_name} pouvait changer ta routine en moins de 3 secondes ? Regarde bien...`,
    scenes: [
      'Scène 1 — Plan macro produit, lumière douce',
      'Scène 2 — Personne avec problème, expression frustrée',
      'Scène 3 — Démonstration produit en action, ralenti',
      'Scène 4 — Réaction WOW, sourire',
      'Scène 5 — Témoignages overlay + logo marque',
      'Scène 6 — Call-to-action animé "Commander maintenant"',
    ],
    captions: [
      '🤯 Tu vas halluciner...',
      `${args.product_name} = game changer`,
      '✅ +12 000 clients conquis',
      'Stock limité ⚡',
      'Lien en bio 👆',
    ],
    hashtags: ['#viralproduct', '#tiktokmademebuyit', '#fyp', '#ecommerce', '#dropship', `#${args.platform.toLowerCase()}`],
    cta: 'Commander maintenant — Lien en bio 👆',
    platform: args.platform,
  };
}

function mockChatReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('produit') || lower.includes('gagnant')) {
    return '🎯 **Stratégie Produit Gagnant**\n\n' +
      '1. Recherche sur Minea & Kalodata (filtres: 7 derniers jours, +500K vues)\n' +
      '2. Vérifie la marge minimum 3x (prix de vente / coût)\n' +
      '3. Teste avec $50/jour de TikTok Ads pendant 3 jours\n' +
      '4. Scale si CPA < 30% du prix de vente\n\n' +
      '💡 Mes 3 critères : viralité + marge saine + saturation faible.';
  }
  if (lower.includes('ads') || lower.includes('pub') || lower.includes('budget')) {
    return '💰 **Stratégie Budget Ads**\n\n' +
      '• Phase test : $50/jour CBO sur 3-5 audiences pendant 72h\n' +
      '• Phase scale : x1.5 budget tous les 2 jours sur les winners (ROAS > 2)\n' +
      '• Kill rule : si ROAS < 1 après $30 dépensés → désactive\n\n' +
      'Cible un BER (Break-Even ROAS) précis avant de scaler !';
  }
  if (lower.includes('roi') || lower.includes('performance') || lower.includes('analyse')) {
    return '📊 **Analyse Performance**\n\n' +
      'Vos KPIs actuels indiquent :\n' +
      '• Revenue : croissance saine\n' +
      '• Conversion : à optimiser (cible 3%+)\n' +
      '• AOV : marge d\'amélioration via upsell + bundles\n\n' +
      '🎯 Action prioritaire : ajouter un upsell post-checkout (+15-25% AOV en moyenne).';
  }
  return '👋 Salut CEO ! Mode hors-ligne activé (backend non connecté).\n\n' +
    'Pour activer Claude AI en temps réel, déployez votre backend FastAPI sur Render/Railway puis définissez la variable `VITE_API_URL` dans Vercel.\n\n' +
    'En attendant, je peux répondre aux questions sur : produits gagnants, stratégie ads, analyse performance, optimisation ROI.';
}

// ---------- API CLIENT ----------
export const api = {
  async getDashboardActions(): Promise<DailyAction[]> {
    return safeFetch<DailyAction[]>('/dashboard/actions', undefined, mockActions);
  },

  async getTrendingProducts(): Promise<Product[]> {
    return safeFetch<Product[]>('/products/trending', undefined, mockProducts);
  },

  async getProduct(id: string): Promise<Product> {
    const fallback = mockProducts.find((p) => p.id === id) ?? mockProducts[0];
    return safeFetch<Product>(`/products/${id}`, undefined, fallback);
  },

  async refreshProducts(): Promise<void> {
    try {
      await safeFetch('/refresh-products', { method: 'POST' }, null);
    } catch {
      /* noop in offline mode */
    }
  },

  async generateAdScript(data: {
    product_name: string;
    product_category: string;
    product_price: number;
    concept_type: string;
    platform: string;
  }): Promise<AdScript> {
    return safeFetch<AdScript>(
      '/ads/generate-script',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      mockAdScript(data),
    );
  },

  async chat(session_id: string, message: string): Promise<ChatResponse> {
    return safeFetch<ChatResponse>(
      '/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, message }),
      },
      { response: mockChatReply(message), session_id },
    );
  },

  isBackendAvailable(): boolean | null {
    return backendAvailable;
  },

  getApiBase(): string {
    return API_BASE;
  },
};
