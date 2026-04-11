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

  getListings: (token: string) =>
    request<any[]>('/listings', {}, token),

  getPrices: (token: string) =>
    request<any[]>('/crop_prices', {}, token),

  createPrice: (
    token: string,
    data: { crop: string; region: string; min_price: number; max_price: number },
  ) =>
    request<any>('/crop_prices', { method: 'POST', body: JSON.stringify(data) }, token),

  updatePrice: (
    token: string,
    id: number,
    data: { crop?: string; region?: string; min_price?: number; max_price?: number },
  ) =>
    request<any>(`/crop_prices/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  deletePrice: (token: string, id: number) =>
    request<{ message: string }>(`/crop_prices/${id}`, { method: 'DELETE' }, token),

  getCrops: (token: string) =>
    request<any[]>('/crops', {}, token),

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

  publishAlert: (token: string, id: number) =>
    request<{ ok: boolean }>(`/alerts/${id}/publish`, { method: 'PUT' }, token),

  dismissAlert: (token: string, id: number) =>
    request<{ ok: boolean }>(`/alerts/${id}/dismiss`, { method: 'PUT' }, token),

  updateAlert: (
    token: string,
    id: number,
    data: { title?: string; message?: string; severity?: string; region?: string },
  ) =>
    request<any>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  deleteAlert: (token: string, id: number) =>
    request<{ message: string }>(`/alerts/${id}`, { method: 'DELETE' }, token),
};
