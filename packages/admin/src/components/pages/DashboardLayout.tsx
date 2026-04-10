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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
  },
  {
    to: '/prices',
    label: 'Prices',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9 10h6" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Users',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/alerts',
    label: 'Alerts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const pageTitles: Record<string, string> = {
  '/listings': 'Listings',
  '/prices': 'Market Prices',
  '/users': 'Users',
  '/alerts': 'Alerts',
};

export function DashboardLayout({ token, onLogout }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAlertsCount, setPendingAlertsCount] = useState(0);
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
      const [listings, prices, users, alerts] = await Promise.all([
        api.getListings(),
        api.getCropPrices(),
        api.getUsers(),
        api.getAlerts().catch(() => []),
      ]);

      const now = Date.now();
      const expiredListings = listings.filter((listing) => {
        const expiresAt = new Date(listing.expires_at).getTime();
        return !listing.status || expiresAt < now;
      }).length;

      const activeListings = listings.filter((listing) => listing.status === 'active').length;

      setPendingAlertsCount((alerts as any[]).filter((a: any) => a.status === 'pending').length);

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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-brand-500 via-cyan-400 to-slate-500 opacity-5 pointer-events-none" />
      
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-slate-900">MoonsuLink</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 px-2 py-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  {link.icon}
                </span>
                <span className="flex-1">{link.label}</span>
                {link.to === '/alerts' && pendingAlertsCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {pendingAlertsCount}
                  </span>
                )}
              </NavLink>
            ))}
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </nav>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-white border-r border-slate-200 shadow-[0_0_45px_rgba(15,23,42,0.06)] flex-col sticky top-0 h-screen">
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
              <span className="flex-1">{link.label}</span>
              {link.to === '/alerts' && pendingAlertsCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingAlertsCount}
                </span>
              )}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-4 sm:p-6">
          <div className="mb-6 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-600">Welcome back</p>
                <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl">
                  A polished admin experience for managing core platform data with confidence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={loadStats}
                  disabled={statsLoading}
                  className="rounded-2xl sm:rounded-3xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/prices')}
                  className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Add price
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/listings')}
                  className="rounded-2xl sm:rounded-3xl border border-brand-200 bg-brand-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  View listings
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  className="relative rounded-2xl sm:rounded-3xl border border-amber-200 bg-amber-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Alerts
                  {pendingAlertsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {pendingAlertsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Listings</p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">{stats.totalListings}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">{stats.activeListings} active · {stats.expiredListings} expired</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-brand-50 p-4 sm:p-5 text-brand-700">
                <p className="text-xs uppercase tracking-[0.22em] text-brand-600">Prices</p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold">{stats.totalPrices}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm">Latest market reference</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Users</p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-slate-900">{stats.totalUsers}</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">Updated {stats.lastUpdated}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
              <button
                type="button"
                onClick={exportListingsCsv}
                disabled={statsLoading || stats.listings.length === 0}
                className="rounded-2xl sm:rounded-3xl bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Export CSV
              </button>
              <span className="text-xs sm:text-sm text-slate-500">
                Export your listings data for offline review.
              </span>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
