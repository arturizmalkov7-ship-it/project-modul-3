import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Card, EmptyState, PageTitle, formatShortDate } from '../components/ui.jsx';

export default function ClientViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, api } = useOutletContext();
  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <>
        <PageTitle title="Клиент" />
        <EmptyState
          title="Клиент не найден"
          description="Запись могла быть удалена или ссылка устарела."
        >
          <Link
            to="/clients"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            К списку клиентов
          </Link>
        </EmptyState>
      </>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm('Удалить клиента? Связанные сделки тоже будут удалены.')) return;
    try {
      await api.deleteClient(id);
      navigate('/clients');
    } catch (err) {
      alert(err.message || 'Не удалось удалить клиента.');
    }
  };

  return (
    <>
      <PageTitle
        title={client.name}
        subtitle={formatShortDate(client.createdAt)}
        actions={
          <>
            <Link
              to={`/clients/${id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Редактировать
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Удалить
            </button>
          </>
        }
      />
      <Card className="max-w-2xl space-y-3 text-sm">
        <div>
          <span className="text-slate-500">Email:</span> <span className="text-slate-900">{client.email}</span>
        </div>
        <div>
          <span className="text-slate-500">Телефон:</span>{' '}
          <span className="text-slate-900">{client.phone}</span>
        </div>
        <div>
          <span className="text-slate-500">Компания:</span>{' '}
          <span className="text-slate-900">{client.company}</span>
        </div>
        {client.note && (
          <div>
            <span className="text-slate-500">Заметка:</span>
            <p className="mt-1 text-slate-800">{client.note}</p>
          </div>
        )}
      </Card>
    </>
  );
}
