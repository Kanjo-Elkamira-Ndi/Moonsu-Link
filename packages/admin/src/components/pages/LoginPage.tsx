import { useState } from 'react';

interface Props {
  onLogin: (name: string, email: string) => void;
  error: string | null;
  loading: boolean;
}

export function LoginPage({ onLogin, error, loading }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/src/assets/moonsuLinkLogo.jpg" alt="MoonsuLink Logo" className="h-12 w-12 mx-auto mb-2" />
          <h1 className="text-xl font-semibold text-gray-900">MoonsuLink Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage the platform</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(name.trim(), email.trim());
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter Username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="password"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter Admin Email Address"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
