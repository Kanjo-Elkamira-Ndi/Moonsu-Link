import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface User {
  id: string;
  phone: string;
  name: string | null;
  channel: string;
  lang: string;
  role: string;
  created_at: string;
}

interface Props { token: string }

export function UsersPage({ token }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers(token).then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const channelBadge: Record<string, string> = {
    telegram: 'bg-blue-100 text-blue-700',
    sms:      'bg-yellow-100 text-yellow-700',
    whatsapp: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{users.length} registered</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 uppercase tracking-wide">
                <th className="text-left px-3 sm:px-4 py-3">Phone</th>
                <th className="text-left px-3 sm:px-4 py-3">Name</th>
                <th className="text-left px-3 sm:px-4 py-3">Channel</th>
                <th className="text-left px-3 sm:px-4 py-3">Lang</th>
                <th className="text-left px-3 sm:px-4 py-3">Role</th>
                <th className="text-left px-3 sm:px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-mono text-xs">{u.phone}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${channelBadge[u.channel] ?? 'bg-gray-100 text-gray-500'}`}>
                      {u.channel}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 uppercase text-xs text-gray-500">{u.lang}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-500 text-xs">{u.role}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No users yet
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
