import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Listing {
  id: string;
  crop: string;
  quantity_kg: number;
  town: string;
  price_fcfa: number;
  status: string;
  farmer_phone: string;
  farmer_name: string | null;
  created_at: string;
  expires_at: string;
}



export function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.getListings()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(
    (l) =>
      !filter ||
      l.crop.toLowerCase().includes(filter.toLowerCase()) ||
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
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 uppercase tracking-wide">
                <th className="text-left px-3 sm:px-4 py-3">ID</th>
                <th className="text-left px-3 sm:px-4 py-3">Crop</th>
                <th className="text-left px-3 sm:px-4 py-3">Qty</th>
                <th className="text-left px-3 sm:px-4 py-3">Town</th>
                <th className="text-left px-3 sm:px-4 py-3">Price</th>
                <th className="text-left px-3 sm:px-4 py-3">Farmer</th>
                <th className="text-left px-3 sm:px-4 py-3">Status</th>
                <th className="text-left px-3 sm:px-4 py-3">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-mono text-xs text-gray-500">{l.id.slice(0, 8)}</td>
                  <td className="px-3 sm:px-4 py-3 font-medium capitalize">{l.crop}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.quantity_kg}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.town}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.price_fcfa}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{l.farmer_name ?? l.farmer_phone}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        l.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {l.status}
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
