import { useEffect, useState, FormEvent } from 'react';
import { pricesApi, MarketPrice } from '../../services/api';

const CROPS = ['maize', 'tomato', 'plantain', 'cassava', 'groundnut', 'cocoa', 'coffee'];
const MARKETS = [
  { market: 'Marché Central',    region: 'Centre' },
  { market: 'Marché Mokolo',     region: 'Centre' },
  { market: 'Marché Mboppi',     region: 'Littoral' },
  { market: 'Marché Bafoussam',  region: 'Ouest' },
];

const EMPTY_FORM = {
  crop: 'maize',
  market: MARKETS[0].market,
  region: MARKETS[0].region,
  min_price: '',
  max_price: '',
  unit: 'kg',
  recorded_at: new Date().toISOString().slice(0, 10),
};

export default function PricesPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await pricesApi.getAll();
      setPrices(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleMarketChange(market: string) {
    const found = MARKETS.find(m => m.market === market);
    setForm(f => ({ ...f, market, region: found?.region || f.region }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await pricesApi.upsert({
        ...form,
        min_price: Number(form.min_price),
        max_price: Number(form.max_price),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Market Prices</h1>
      <p className="text-sm text-gray-500 mb-6">Update weekly prices from MINADER data or market visits</p>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Add / Update Price</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Crop</label>
            <select
              value={form.crop}
              onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            >
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Market</label>
            <select
              value={form.market}
              onChange={e => handleMarketChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            >
              {MARKETS.map(m => <option key={m.market}>{m.market}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min FCFA/kg</label>
            <input
              type="number" required min="1"
              value={form.min_price}
              onChange={e => setForm(f => ({ ...f, min_price: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              placeholder="200"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max FCFA/kg</label>
            <input
              type="number" required min="1"
              value={form.max_price}
              onChange={e => setForm(f => ({ ...f, max_price: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              placeholder="350"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              value={form.recorded_at}
              onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit" disabled={saving}
              className="w-full bg-green-600 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Crop', 'Market', 'Region', 'Min (FCFA/kg)', 'Max (FCFA/kg)', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : prices.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No prices yet. Add the first one above.</td></tr>
            ) : prices.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium capitalize">{p.crop}</td>
                <td className="px-4 py-3 text-gray-600">{p.market}</td>
                <td className="px-4 py-3 text-gray-600">{p.region}</td>
                <td className="px-4 py-3">{Number(p.min_price).toLocaleString()}</td>
                <td className="px-4 py-3">{Number(p.max_price).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{p.recorded_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
