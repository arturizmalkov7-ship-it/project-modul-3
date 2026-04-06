import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { DEAL_STAGES } from '../mockData.js';
import { Card, EmptyState, PageTitle } from '../components/ui.jsx';

export default function DealFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname === '/deals/new';
  const navigate = useNavigate();
  const { clients, deals, setDeals } = useOutletContext();
  const existing = !isNew ? deals.find((d) => d.id === id) : null;

  const [form, setForm] = useState({
    title: existing?.title || '',
    amount: existing?.amount ?? '',
    stage: existing?.stage || 'lead',
    clientId: existing?.clientId || clients[0]?.id || '',
    comment: existing?.comment || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'amount' ? value : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount) || 0;
    const client = clients.find((c) => c.id === form.clientId);
    const clientName = client?.name || '—';

    if (isNew) {
      const newId = `d${Date.now()}`;
      setDeals((list) => [
        ...list,
        {
          id: newId,
          title: form.title,
          amount,
          stage: form.stage,
          clientId: form.clientId,
          clientName,
          comment: form.comment,
          updatedAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      navigate(`/deals/${newId}`);
    } else if (existing) {
      setDeals((list) =>
        list.map((d) =>
          d.id === id
            ? {
                ...d,
                title: form.title,
                amount,
                stage: form.stage,
                clientId: form.clientId,
                clientName,
                comment: form.comment,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : d
        )
      );
      navigate(`/deals/${id}`);
    }
  };

  if (!isNew && !existing) {
    return (
      <>
        <PageTitle title="Редактирование сделки" />
        <EmptyState
          title="Сделка не найдена"
          description="Нельзя редактировать удалённую или несуществующую запись."
        >
          <Link
            to="/deals"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            К списку сделок
          </Link>
        </EmptyState>
      </>
    );
  }

  if (isNew && clients.length === 0) {
    return (
      <>
        <PageTitle title="Новая сделка" />
        <EmptyState
          title="Нужен хотя бы один клиент"
          description="Сделка привязывается к клиенту. Сначала добавьте контрагента в разделе «Клиенты»."
        >
          <Link
            to="/clients/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Новый клиент
          </Link>
          <Link
            to="/deals"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            К сделкам
          </Link>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageTitle
        title={isNew ? 'Новая сделка' : 'Редактирование сделки'}
        actions={
          <Link to={isNew ? '/deals' : `/deals/${id}`} className="text-sm text-emerald-700">
            Отмена
          </Link>
        }
      />
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Название</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Сумма (₽)</label>
            <input
              name="amount"
              type="number"
              min={0}
              value={form.amount}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Этап</label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Клиент</label>
            <select
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Комментарий</label>
            <textarea
              name="comment"
              value={form.comment}
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
