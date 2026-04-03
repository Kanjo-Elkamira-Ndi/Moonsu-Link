import { useState } from 'react';

interface Props {
  onLogin: (password: string) => void;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onLogin, error, loading }: Props) {
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl mb-2">🌙</div>
          <h1 className="text-xl font-semibold text-gray-900">MoonsuLink Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage the platform</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(password);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Admin password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
