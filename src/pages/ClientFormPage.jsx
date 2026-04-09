import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Card, EmptyState, PageTitle } from '../components/ui.jsx';

export default function ClientFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname === '/clients/new';
  const navigate = useNavigate();
  const { clients, api } = useOutletContext();
  const existing = !isNew ? clients.find((c) => c.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    email: existing?.email || '',
    phone: existing?.phone || '',
    company: existing?.company || '',
    note: existing?.note || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) {
      try {
        const created = await api.createClient(form);
        navigate(`/clients/${created.id}`);
      } catch (err) {
        alert(err.message || 'Не удалось создать клиента.');
      }
    } else if (existing) {
      try {
        await api.updateClient(id, form);
        navigate(`/clients/${id}`);
      } catch (err) {
        alert(err.message || 'Не удалось обновить клиента.');
      }
    }
  };

  if (!isNew && !existing) {
    return (
      <>
        <PageTitle title="Редактирование клиента" />
        <EmptyState
          title="Клиент не найден"
          description="Нельзя редактировать удалённую или несуществующую запись."
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

  return (
    <>
      <PageTitle
        title={isNew ? 'Новый клиент' : 'Редактирование клиента'}
        actions={
          <Link to={isNew ? '/clients' : `/clients/${id}`} className="text-sm text-emerald-700">
            Отмена
          </Link>
        }
      />
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone', 'company'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 capitalize">
                {field === 'name' ? 'Название / ФИО' : field === 'company' ? 'Компания' : field}
              </label>
              <input
                name={field}
                value={form[field]}
                onChange={handleChange}
                required={field === 'name'}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700">Заметка</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Сохранить
          </button>
        </form>
      </Card>
    </>
  );
}
