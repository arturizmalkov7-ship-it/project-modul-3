import { Link, useOutletContext } from 'react-router-dom';
import { Card, EmptyState, PageTitle } from '../components/ui.jsx';

export default function ClientsListPage() {
  const { clients, setClients, setDeals } = useOutletContext();

  const handleDeleteClient = (clientId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Удалить клиента? Связанные сделки тоже будут удалены.')) return;
    setClients((list) => list.filter((c) => c.id !== clientId));
    setDeals((list) => list.filter((d) => d.clientId !== clientId));
  };

  return (
    <>
      <PageTitle
        title="Клиенты"
        subtitle="Список компаний и контактов"
        actions={
          <Link
            to="/clients/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Новый клиент
          </Link>
        }
      />
      {clients.length === 0 ? (
        <EmptyState
          title="Клиентов пока нет"
          description="Создайте первую карточку клиента — её можно будет привязать к сделкам."
        >
          <Link
            to="/clients/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Новый клиент
          </Link>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Компания</th>
                <th className="w-24 px-4 py-3 font-medium" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${c.id}`} className="font-medium text-emerald-700 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{c.company}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClient(c.id, e)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-800"
                    >
                      Удалить
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
