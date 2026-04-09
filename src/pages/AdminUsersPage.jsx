import { useEffect, useState } from 'react';
import { Card, EmptyState, PageTitle } from '../components/ui.jsx';
import { fetchUsers, updateUserAdmin } from '../lib/crmApi.js';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError('');
      try {
        const rows = await fetchUsers();
        if (mounted) setUsers(rows);
      } catch (err) {
        if (mounted) setError(err.message || 'Не удалось загрузить пользователей.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChangeRole = async (id, role) => {
    try {
      const updated = await updateUserAdmin(id, {
        role,
        active: users.find((u) => u.id === id)?.active ?? true,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err.message || 'Не удалось изменить роль.');
    }
  };

  const handleToggleActive = async (id) => {
    const row = users.find((u) => u.id === id);
    if (!row) return;
    try {
      const updated = await updateUserAdmin(id, { role: row.role, active: !row.active });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err.message || 'Не удалось обновить статус.');
    }
  };

  return (
    <>
      <PageTitle title="Пользователи" />
      {loading ? (
        <Card>Загрузка...</Card>
      ) : error ? (
        <Card className="text-rose-700">{error}</Card>
      ) : users.length === 0 ? (
        <EmptyState
          title="Пользователей нет"
          description="Когда появятся учётные записи, они отобразятся в этой таблице."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Роль</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    >
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id)}
                      className={u.active ? 'text-emerald-600' : 'text-slate-400'}
                    >
                      {u.active ? 'Активен' : 'Отключён'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
