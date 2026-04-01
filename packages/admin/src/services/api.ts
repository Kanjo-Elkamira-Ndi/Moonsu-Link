const TOKEN_KEY = 'moonsuLink_admin_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Prices ────────────────────────────────────────────────────────────────────
export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  region: string;
  min_price: number;
  max_price: number;
  unit: string;
  recorded_at: string;
}

export const pricesApi = {
  getAll: () => apiFetch<MarketPrice[]>('/prices'),
  getCrops: () => apiFetch<string[]>('/prices/crops'),
  upsert: (data: Omit<MarketPrice, 'id'>) =>
    apiFetch<MarketPrice>('/prices', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Listings ──────────────────────────────────────────────────────────────────
export interface Listing {
  id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
  region?: string;
  status: string;
  expires_at: string;
  created_at: string;
  farmer_name?: string;
  farmer_phone?: string;
}

export const listingsApi = {
  getAll: (page = 1) => apiFetch<{ listings: Listing[]; total: number }>(`/listings?page=${page}`),
  cancel: (id: string) => apiFetch(`/listings/${id}/cancel`, { method: 'PATCH' }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  name?: string;
  role: string;
  language: string;
  region?: string;
  channel: string;
  is_active: boolean;
  registered_at: string;
}

export const usersApi = {
  getAll: (page = 1) => apiFetch<{ users: User[]; total: number }>(`/users?page=${page}`),
};
