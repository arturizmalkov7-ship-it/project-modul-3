import { Card, EmptyState, PageTitle } from '../components/ui.jsx';
import { mockUsers } from '../mockData.js';

export default function AdminUsersPage() {
  return (
    <>
      <PageTitle
        title="Пользователи"
        subtitle="Список для администратора (моковые данные)"
      />
      {mockUsers.length === 0 ? (
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
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="text-emerald-600">Активен</span>
                    ) : (
                      <span className="text-slate-400">Отключён</span>
                    )}
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
