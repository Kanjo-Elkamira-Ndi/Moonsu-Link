import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Price {
  id: string;
  crop: string;
  market: string;
  region: string | null;
  min_price: number;
  max_price: number;
  recorded_at: string;
}



const BLANK = { crop: '', market: '', region: '', min_price: '', max_price: '' };

export function PricesPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const reload = () =>
    api.getCropPrices()
        .then(setPrices)
        .catch(console.error)
        .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop || !form.market || !form.min_price || !form.max_price) return;
    setSaving(true);
    try {
      await api.upsertCropPrice( {
        crop: form.crop.toLowerCase(),
        market: form.market,
        region: form.region || undefined,
        min_price: Number(form.min_price),
        max_price: Number(form.max_price),
      });
      setSaved(true);
      setForm(BLANK);
      await reload();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Market Prices</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add or update today's prices. Farmers query these via SMS/Telegram.</p>
      </div>

      {/* Add / Edit form */}
      <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Update a price</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'crop',      label: 'Crop',       placeholder: 'e.g. maize' },
            { key: 'market',    label: 'Market',     placeholder: 'e.g. Yaoundé' },
            { key: 'region',    label: 'Region',     placeholder: 'e.g. Centre (optional)' },
            { key: 'min_price', label: 'Min (FCFA/kg)', placeholder: '150' },
            { key: 'max_price', label: 'Max (FCFA/kg)', placeholder: '200' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type={key.includes('price') ? 'number' : 'text'}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Price table */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 uppercase tracking-wide">
                <th className="text-left px-3 sm:px-4 py-3">Crop</th>
                <th className="text-left px-3 sm:px-4 py-3">Market</th>
                <th className="text-left px-3 sm:px-4 py-3">Region</th>
                <th className="text-left px-3 sm:px-4 py-3">Min</th>
                <th className="text-left px-3 sm:px-4 py-3">Max</th>
                <th className="text-left px-3 sm:px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prices.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-medium capitalize">{p.crop}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{p.market}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-400">{p.region ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{p.min_price}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{p.max_price}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-400 text-xs">{new Date(p.recorded_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
              {prices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No prices yet. Add one above.
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
