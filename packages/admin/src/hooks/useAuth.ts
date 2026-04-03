import { useState, useCallback } from 'react';
import { api } from '../services/api';

const TOKEN_KEY = 'moonsulink_admin_token';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return { token, login, logout, error, loading, isAuthenticated: !!token };
}
