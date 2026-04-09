import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Card, EmptyState, PageTitle, formatMoney, formatShortDate, stageMeta } from '../components/ui.jsx';

export default function DealViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deals, api } = useOutletContext();
  const deal = deals.find((d) => d.id === id);

  if (!deal) {
    return (
      <>
        <PageTitle title="Сделка" />
        <EmptyState
          title="Сделка не найдена"
          description="Запись могла быть удалена или ссылка устарела."
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

  const st = stageMeta(deal.stage);
  const handleDelete = async () => {
    if (!window.confirm('Удалить сделку?')) return;
    try {
      await api.deleteDeal(id);
      navigate('/deals');
    } catch (err) {
      alert(err.message || 'Не удалось удалить сделку.');
    }
  };

  return (
    <>
      <PageTitle
        title={deal.title}
        subtitle={formatShortDate(deal.updatedAt)}
        actions={
          <>
            <Link
              to={`/deals/${id}/edit`}
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
          <span className="text-slate-500">Сумма:</span>{' '}
          <span className="text-lg font-semibold text-slate-900">{formatMoney(deal.amount)}</span>
        </div>
        <div>
          <span className="text-slate-500">Этап:</span>{' '}
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
            {st.label}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Клиент:</span>{' '}
          <Link to={`/clients/${deal.clientId}`} className="text-emerald-700 hover:underline">
            {deal.clientName}
          </Link>
        </div>
        {deal.comment && (
          <div>
            <span className="text-slate-500">Комментарий:</span>
            <p className="mt-1 text-slate-800">{deal.comment}</p>
          </div>
        )}
      </Card>
    </>
  );
}
