import type { DailyAction, Product, AdScript, ChatResponse } from '../types';

export type { DailyAction, Product, AdScript, ChatResponse };

const API_BASE = '/api';

export const api = {
  async getDashboardActions(): Promise<DailyAction[]> {
    const res = await fetch(`${API_BASE}/dashboard/actions`);
    return res.json();
  },

  async getTrendingProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/trending`);
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async refreshProducts(): Promise<void> {
    await fetch(`${API_BASE}/refresh-products`, { method: 'POST' });
  },

  async generateAdScript(data: {
    product_name: string;
    product_category: string;
    product_price: number;
    concept_type: string;
    platform: string;
  }): Promise<AdScript> {
    const res = await fetch(`${API_BASE}/ads/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async chat(session_id: string, message: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, message }),
    });
    return res.json();
  },
};
