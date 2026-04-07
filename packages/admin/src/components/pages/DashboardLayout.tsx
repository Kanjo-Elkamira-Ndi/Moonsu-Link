import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Props {
  token: string;
  onLogout: () => void;
}

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  expiredListings: number;
  totalPrices: number;
  totalUsers: number;
  lastUpdated: string;
  listings: any[];
}

const links = [
  {
    to: '/listings',
    label: 'Listings',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    to: '/prices',
    label: 'Prices',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9 10h6" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Users',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const pageTitles: Record<string, string> = {
  '/listings': 'Listings',
  '/prices': 'Market Prices',
  '/users': 'Users',
};

export function DashboardLayout({ token, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard';
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    expiredListings: 0,
    totalPrices: 0,
    totalUsers: 0,
    lastUpdated: '—',
    listings: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [listings, prices, users] = await Promise.all([
        api.getListings(token),
        api.getPrices(token),
        api.getUsers(token),
      ]);

      const now = Date.now();
      const expiredListings = listings.filter((listing) => {
        const expiresAt = new Date(listing.expires_at).getTime();
        return !listing.status || expiresAt < now;
      }).length;

      const activeListings = listings.filter((listing) => listing.status === 'active').length;

      setStats({
        totalListings: listings.length,
        activeListings,
        expiredListings,
        totalPrices: prices.length,
        totalUsers: users.length,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        listings,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  const exportListingsCsv = () => {
    const rows = stats.listings.map((listing) => ({
      id: listing.id,
      crop: listing.crop,
      quantity_kg: listing.quantity_kg,
      town: listing.town,
      price_fcfa: listing.price_fcfa,
      status: listing.status,
      farmer_phone: listing.farmer_phone,
      farmer_name: listing.farmer_name ?? '',
      created_at: listing.created_at,
      expires_at: listing.expires_at,
    }));
    const csv = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `listings-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-brand-500 via-cyan-400 to-slate-500 opacity-5 pointer-events-none" />
      <div className="relative flex min-h-screen">
        <aside className="w-72 shrink-0 bg-white border-r border-slate-200 shadow-[0_0_45px_rgba(15,23,42,0.06)] flex flex-col">
          <div className="px-6 py-7 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">MoonsuLink</p>
                <p className="text-sm text-slate-500 mt-0.5">Admin dashboard</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Clean tracking for listings, market prices, and users.
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-6 py-6 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-600">Welcome back</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
                  <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                    A polished admin experience for managing core platform data with confidence.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={loadStats}
                    disabled={statsLoading}
                    className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statsLoading ? 'Refreshing…' : 'Refresh stats'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/prices')}
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Add price
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/listings')}
                    className="rounded-3xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    View listings
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Listings</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.totalListings}</p>
                  <p className="mt-2 text-sm text-slate-500">{stats.activeListings} active · {stats.expiredListings} expired</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-brand-50 p-5 text-brand-700">
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-600">Prices</p>
                  <p className="mt-3 text-3xl font-semibold">{stats.totalPrices}</p>
                  <p className="mt-2 text-sm">Latest market reference</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Users</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.totalUsers}</p>
                  <p className="mt-2 text-sm text-slate-500">Updated {stats.lastUpdated}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportListingsCsv}
                  disabled={statsLoading || stats.listings.length === 0}
                  className="rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Export listings CSV
                </button>
                <span className="self-center text-sm text-slate-500">
                  Export your current listings data for offline review.
                </span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
