import { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface User {
  id: string;
  name: string | null;
  role: string;
  region?: string | null;
  lang: string;
  verified?: boolean | null;
  telegramId?: string | null;
  telegramPhone?: string | null;
  whatsappPhone?: string | null;
}

interface Props { token: string }

export function UsersPage({ token }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers(token).then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, [token]);

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
                <th className="text-left px-3 sm:px-4 py-3">User ID</th>
                <th className="text-left px-3 sm:px-4 py-3">Name</th>
                <th className="text-left px-3 sm:px-4 py-3">Role</th>
                <th className="text-left px-3 sm:px-4 py-3">Region</th>
                <th className="text-left px-3 sm:px-4 py-3">Language</th>
                <th className="text-left px-3 sm:px-4 py-3">Verified</th>
                <th className="text-left px-3 sm:px-4 py-3">Telegram ID</th>
                <th className="text-left px-3 sm:px-4 py-3">Telegram Phone</th>
                <th className="text-left px-3 sm:px-4 py-3">WhatsApp Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 font-mono text-xs">{u.id}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.name ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-500 text-xs">{u.role}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.region ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 sm:px-4 py-3 uppercase text-xs text-gray-500">{u.lang}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.telegramId ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.telegramPhone ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700">{u.whatsappPhone ?? <span className="text-gray-300">—</span>}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
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
