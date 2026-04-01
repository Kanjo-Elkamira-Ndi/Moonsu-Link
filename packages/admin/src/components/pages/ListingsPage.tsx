import { useEffect, useState } from 'react';
import { listingsApi, Listing } from '../../services/api';

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  sold:      'bg-blue-100 text-blue-700',
  expired:   'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p: number) {
    setLoading(true);
    try {
      const data = await listingsApi.getAll(p);
      setListings(data.listings);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this listing?')) return;
    await listingsApi.cancel(id);
    load(page);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Listings</h1>
      <p className="text-sm text-gray-500 mb-6">All farmer produce listings — {total} total</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Crop', 'Qty (kg)', 'Price/kg', 'Location', 'Farmer', 'Status', 'Expires', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : listings.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No listings yet.</td></tr>
            ) : listings.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium capitalize">{l.crop}</td>
                <td className="px-4 py-3">{Number(l.quantity_kg).toLocaleString()}</td>
                <td className="px-4 py-3">{Number(l.price_per_kg).toLocaleString()} FCFA</td>
                <td className="px-4 py-3 text-gray-600">{l.location}</td>
                <td className="px-4 py-3 text-gray-600">{l.farmer_name || l.farmer_phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[l.status] || ''}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{l.expires_at?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  {l.status === 'active' && (
                    <button
                      onClick={() => handleCancel(l.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
