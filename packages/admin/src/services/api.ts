/// <reference types="vite/client" />

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? 'Request failed');
  }

  return res.json();
}

export const api = {
  login: (name: string, email: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    }),

  getListings: () =>
    request<any[]>('/listings'),

  getCrops: () =>
    request<any[]>('/crops'),

  getCropPrices: () =>
    request<any[]>('/crop_prices'),

  upsertCropPrice: (data: {
    crop: string;
    market: string;
    region?: string;
    min_price: number;
    max_price: number;
  }) =>
    request<{ ok: boolean }>('/crop_prices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUsers: () =>
    request<any[]>('/users'),

  // ── Alerts ────────────────────────────────────────────────────────────────
  getAlerts: () =>
    request<any[]>('/alerts'),

  createAlert: (
    data: { title: string; message: string; severity: string; region?: string; submitted_by?: string },
  ) =>
    request<any>('/alerts', { method: 'POST', body: JSON.stringify(data) }),

  publishAlert: ( id: string) =>
    request<{ ok: boolean }>(`/alerts/${id}/publish`, { method: 'PATCH' }),

  dismissAlert: ( id: string) =>
    request<{ ok: boolean }>(`/alerts/${id}/dismiss`, { method: 'PATCH' }),
};
