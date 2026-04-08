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
  login: (password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  getListings: (token: string) =>
    request<any[]>('/listings', {}, token),

  getPrices: (token: string) =>
    request<any[]>('/prices', {}, token),

  upsertPrice: (
    token: string,
    data: { crop: string; market: string; region?: string; min_price: number; max_price: number },
  ) =>
    request<{ ok: boolean }>('/prices', { method: 'POST', body: JSON.stringify(data) }, token),

  getUsers: (token: string) =>
    request<any[]>('/users', {}, token),

  // ── Alerts ────────────────────────────────────────────────────────────────
  getAlerts: (token: string) =>
    request<any[]>('/alerts', {}, token),

  createAlert: (
    token: string,
    data: { title: string; message: string; severity: string; region?: string; submitted_by?: string },
  ) =>
    request<any>('/alerts', { method: 'POST', body: JSON.stringify(data) }, token),

  publishAlert: (token: string, id: string) =>
    request<{ ok: boolean }>(`/alerts/${id}/publish`, { method: 'PATCH' }, token),

  dismissAlert: (token: string, id: string) =>
    request<{ ok: boolean }>(`/alerts/${id}/dismiss`, { method: 'PATCH' }, token),
};
