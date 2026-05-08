export interface DailyAction {
  id: string;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  product_name: string | null;
  recommended_budget: number | null;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  viral_score: number;
  profit_score: number;
  competition_score: number;
  total_score: number;
  source: string;
  views: number;
  engagement: number;
  market_saturation: string;
  potential_regions: string[];
  trending_since?: string;
}

export interface AdScript {
  id: string;
  product_id: string;
  concept_type: string;
  hook: string;
  script: string;
  voiceover: string;
  scenes: string[];
  captions: string[];
  hashtags: string[];
  cta: string;
  platform: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}
