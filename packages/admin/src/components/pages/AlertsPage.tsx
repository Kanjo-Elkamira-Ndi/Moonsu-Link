import { useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, Info, Inbox, MapPin } from 'lucide-react';
import { api } from '../../services/api';

type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'pending' | 'published' | 'dismissed';

type SeverityIcon = typeof Info;

export interface PlatformAlert {
  id: number;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  submitted_by?: string;
  region?: string;
  created_at: string;
  published_at?: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, { badge: string; row: string; icon: SeverityIcon }> = {
  info:     { badge: 'bg-blue-50 text-blue-700 border border-blue-200',     row: 'bg-white',       icon: Info },
  warning:  { badge: 'bg-amber-50 text-amber-700 border border-amber-200',  row: 'bg-amber-50/40', icon: AlertTriangle },
  critical: { badge: 'bg-red-50 text-red-700 border border-red-200',        row: 'bg-red-50/40',   icon: AlertOctagon },
};

const STATUS_STYLES: Record<AlertStatus, string> = {
  pending:   'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  dismissed: 'bg-slate-100 text-slate-400 line-through',
};

const ALERT_TYPES = [
  'Pest outbreak',
  'Disease outbreak',
  'Sharp price increase',
  'Sharp price decrease',
  'Weather warning',
  'Road/transport disruption',
  'Market closure',
  'Other',
];

interface Props { token: string; }

export function AlertsPage({ token }: Props) {
  const [alerts, setAlerts]     = useState<PlatformAlert[]>([]);
  const [loading, setLoading]   = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState<'all' | AlertStatus>('all');

  // New alert form state
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity: 'warning' as AlertSeverity,
    region: '',
    submitted_by: 'Admin',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.getAlerts(token);
      setAlerts(data);
    } catch {
      // API not yet wired — show empty state gracefully
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handlePublish(id: string) {
    setPublishing(id);
    try {
      await api.publishAlert(token, id);
      setAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, status: 'published', published_at: new Date().toISOString() } : a
      ));
    } catch (e: any) {
      alert('Failed to publish: ' + e.message);
    } finally {
      setPublishing(null);
    }
  }

  async function handleDismiss(id: string) {
    try {
      await api.dismissAlert(token, id);
      setAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, status: 'dismissed' } : a
      ));
    } catch (e: any) {
      alert('Failed to dismiss: ' + e.message);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const created = await api.createAlert(token, {
        title: form.title.trim(),
        message: form.message.trim(),
        severity: form.severity,
        region: form.region.trim() || undefined,
        submitted_by: form.submitted_by.trim() || 'Admin',
      });
      setAlerts(prev => [created, ...prev]);
      setForm({ title: '', message: '', severity: 'warning', region: '', submitted_by: 'Admin' });
      setShowForm(false);
      setSaveMsg('Alert created.');
    } catch (e: any) {
      setSaveMsg('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const pendingCount = alerts.filter(a => a.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Platform Alerts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review farmer-submitted alerts and broadcast them to all users.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {showForm ? 'Cancel' : 'New alert'}
        </button>
      </div>

      {/* Pending badge */}
      {pendingCount > 0 && !showForm && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <p className="text-sm font-medium text-amber-800">
            {pendingCount} alert{pendingCount > 1 ? 's' : ''} waiting for review — publish or dismiss them below.
          </p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Create a new alert</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Alert type / title</label>
              <div className="flex gap-2">
                <select
                  value={ALERT_TYPES.includes(form.title) ? form.title : ''}
                  onChange={e => e.target.value && setForm(f => ({ ...f, title: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">— pick a type —</option>
                  {ALERT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="or type a custom title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Message to broadcast</label>
              <textarea
                rows={3}
                required
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe the alert clearly in plain language. This will be sent to all users via Telegram and SMS."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value as AlertSeverity }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="info">Info — general update</option>
                <option value="warning">Warning — act soon</option>
                <option value="critical">Critical — act immediately</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Region (optional)</label>
              <input
                type="text"
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                placeholder="e.g. Ouest, Centre, Littoral — leave blank for nationwide"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving || !form.title.trim() || !form.message.trim()}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Create alert'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            {saveMsg && <span className="text-xs text-slate-500">{saveMsg}</span>}
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'pending', 'published', 'dismissed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition capitalize ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? `All (${alerts.length})` : f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading alerts…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl mb-3 inline-flex items-center justify-center rounded-3xl bg-slate-100 p-6 text-slate-400">
            <Inbox className="h-10 w-10" />
          </div>
          <p className="text-sm font-medium text-slate-600">No alerts yet</p>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'all'
              ? 'Alerts submitted by farmers will appear here for review.'
              : `No ${filter} alerts.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div
              key={alert.id}
              className={`rounded-2xl border border-slate-200 p-4 sm:p-5 transition ${SEVERITY_STYLES[alert.severity].row}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {(() => {
                    const Icon = SEVERITY_STYLES[alert.severity].icon;
                    return <Icon className="h-6 w-6 mt-0.5 shrink-0 text-slate-900" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{alert.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[alert.severity].badge}`}>
                        {alert.severity}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[alert.status]}`}>
                        {alert.status}
                      </span>
                      {alert.region && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {alert.region}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{alert.message}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {alert.submitted_by && <span>Submitted by: {alert.submitted_by}</span>}
                      <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                      {alert.published_at && (
                        <span className="text-green-600">
                          Published: {new Date(alert.published_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {alert.status === 'pending' && (
                  <div className="flex gap-2 shrink-0 sm:flex-col lg:flex-row">
                    <button
                      onClick={() => handlePublish(alert.id)}
                      disabled={publishing === alert.id}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {publishing === alert.id ? (
                        'Publishing…'
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                          </svg>
                          Publish
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {alert.status === 'published' && (
                  <div className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-xs font-medium text-green-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Broadcast sent
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
