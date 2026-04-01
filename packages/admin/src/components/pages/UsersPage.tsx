import { useEffect, useState } from 'react';
import { usersApi, User } from '../../services/api';

const ROLE_COLORS: Record<string, string> = {
  farmer: 'bg-green-100 text-green-700',
  buyer:  'bg-blue-100 text-blue-700',
  admin:  'bg-purple-100 text-purple-700',
};

const CHANNEL_ICONS: Record<string, string> = {
  telegram:  '✈️',
  sms:       '📱',
  whatsapp:  '💬',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p: number) {
    setLoading(true);
    try {
      const data = await usersApi.getAll(p);
      setUsers(data.users);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Users</h1>
      <p className="text-sm text-gray-500 mb-6">Registered farmers and buyers — {total} total</p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name / Phone', 'Role', 'Channel', 'Language', 'Region', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users yet.</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name || '—'}</div>
                  <div className="text-xs text-gray-400">{u.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] || ''}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {CHANNEL_ICONS[u.channel]} {u.channel}
                </td>
                <td className="px-4 py-3 text-gray-600 uppercase text-xs">{u.language}</td>
                <td className="px-4 py-3 text-gray-500">{u.region || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.registered_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
                className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
