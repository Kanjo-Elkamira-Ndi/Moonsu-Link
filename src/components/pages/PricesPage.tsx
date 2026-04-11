import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Price {
  id: number;
  crop_name: string;
  region: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  created_at: string | Date;
}

interface Crop {
  id: number;
  name: string;
}

interface Props { token: string }

const REGIONS = [
  'Adamaoua',
  'Centre',
  'Est',
  'Extrême-Nord',
  'Littoral',
  'Nord',
  'Nord-Ouest',
  'Ouest',
  'Sud',
  'Sud-Ouest',
  'General',
];

const BLANK = { crop: '', region: 'General', min_price: '', max_price: '' };

export function PricesPage({ token }: Props) {
  const [prices, setPrices] = useState<Price[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesData, cropsData] = await Promise.all([
        api.getPrices(token),
        api.getCrops(token),
      ]);
      setPrices(pricesData);
      setCrops(cropsData);
    } catch (err) {
      console.error('Failed to load prices and crops:', err);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.crop.trim() || !form.region || !form.min_price || !form.max_price) return;
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await api.updatePrice(token, editingId, {
          crop: form.crop.trim(),
          region: form.region,
          min_price: Number(form.min_price),
          max_price: Number(form.max_price),
        });
      } else {
        await api.createPrice(token, {
          crop: form.crop.trim(),
          region: form.region,
          min_price: Number(form.min_price),
          max_price: Number(form.max_price),
        });
      }

      setSaved(true);
      setForm(BLANK);
      setEditingId(null);
      await reload();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save price:', err);
      setError('Failed to save price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (price: Price) => {
    setEditingId(price.id);
    setForm({
      crop: price.crop_name,
      region: price.region,
      min_price: String(price.min_price),
      max_price: String(price.max_price),
    });
    setSaved(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(BLANK);
    setSaved(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this market price?')) return;
    setSaving(true);
    setError(null);
    try {
      await api.deletePrice(token, id);
      if (editingId === id) cancelEdit();
      await reload();
    } catch (err) {
      console.error('Failed to delete price:', err);
      setError('Failed to delete price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Market Prices</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add, edit, or delete market prices. New prices are broadcast to all users.</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700">{editingId ? 'Edit market price' : 'Add market price'}</h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-brand-600 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Crop</label>
            <input
              list="crop-options"
              type="text"
              value={form.crop}
              onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
              placeholder="e.g. maize"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <datalist id="crop-options">
              {crops.map((crop) => (
                <option key={crop.id} value={crop.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Region</label>
            <select
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Min price (FCFA/kg)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.min_price}
              onChange={(e) => setForm((f) => ({ ...f, min_price: e.target.value }))}
              placeholder="150"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Max price (FCFA/kg)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.max_price}
              onChange={(e) => setForm((f) => ({ ...f, max_price: e.target.value }))}
              placeholder="200"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved' : editingId ? 'Update price' : 'Create price'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={reload}
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
                <th className="text-left px-3 sm:px-4 py-3">Crop</th>
                <th className="text-left px-3 sm:px-4 py-3">Region</th>
                <th className="text-left px-3 sm:px-4 py-3">Min</th>
                <th className="text-left px-3 sm:px-4 py-3">Max</th>
                <th className="text-left px-3 sm:px-4 py-3">Avg</th>
                <th className="text-left px-3 sm:px-4 py-3">Created</th>
                <th className="text-left px-3 sm:px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-medium capitalize">{price.crop_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{price.region}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{price.min_price}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{price.max_price}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-600">{price.avg_price}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-400 text-xs">{new Date(price.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(price)}
                        className="text-brand-600 hover:text-brand-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(price.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {prices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No market prices yet. Add one above.
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
