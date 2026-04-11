import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Listing {
  id: number;
  quantity_kg: number;
  price: number;
  town: string;
  image_url?: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
  user_name: string;
  crop_name: string;
}

interface Props { token: string }

export function ListingsPage({ token }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.getListings(token)
      .then(setListings)
      .catch((err) => {
        console.error('Failed to load listings:', err);
        setError('Failed to load listings. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = listings.filter(
    (l) =>
      !filter ||
      l.crop_name.toLowerCase().includes(filter.toLowerCase()) ||
      l.town.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Listings</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{listings.length} total</p>
        </div>
        <input
          type="text"
          placeholder="Filter by crop or town..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              api.getListings(token)
                .then(setListings)
                .catch((err) => {
                  console.error('Failed to load listings:', err);
                  setError('Failed to load listings. Please check your connection and try again.');
                })
                .finally(() => setLoading(false));
            }}
            className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 uppercase tracking-wide">
                <th className="text-left px-3 sm:px-4 py-3">ID</th>
                <th className="text-left px-3 sm:px-4 py-3">Crop</th>
                <th className="text-left px-3 sm:px-4 py-3">Qty (kg)</th>
                <th className="text-left px-3 sm:px-4 py-3">Town</th>
                <th className="text-left px-3 sm:px-4 py-3">Price (FCFA)</th>
                <th className="text-left px-3 sm:px-4 py-3">Farmer</th>
                <th className="text-left px-3 sm:px-4 py-3">Expires</th>
                <th className="text-left px-3 sm:px-4 py-3">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-mono text-xs text-gray-500">{l.id}</td>
                  <td className="px-3 sm:px-4 py-3 font-medium capitalize">{l.crop_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.quantity_kg}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.town}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.price.toLocaleString()}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.user_name ?? 'Unknown'}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      new Date(l.expires_at) > new Date() 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {new Date(l.expires_at) > new Date() ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-400 text-xs">
                    {new Date(l.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
