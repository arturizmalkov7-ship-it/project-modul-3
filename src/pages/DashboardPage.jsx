import { Link, useOutletContext } from 'react-router-dom';
import { Card, EmptyState, PageTitle, formatMoney } from '../components/ui.jsx';

export default function DashboardPage() {
  const { clients, deals } = useOutletContext();
  const totalAmount = deals.reduce((s, d) => s + d.amount, 0);
  const won = deals.filter((d) => d.stage === 'won').length;
  const isTotallyEmpty = clients.length === 0 && deals.length === 0;

  return (
    <>
      <PageTitle title="Дашборд" />
      {isTotallyEmpty ? (
        <EmptyState
          title="Пока нет данных"
          description="Добавьте клиента и сделку — здесь появятся счётчики и суммы."
        >
          <Link
            to="/clients/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Новый клиент
          </Link>
          <Link
            to="/deals/new"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Новая сделка
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">Клиенты</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{clients.length}</p>
            {clients.length === 0 && <p className="mt-2 text-xs text-slate-400">Список клиентов пуст</p>}
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Сделки всего</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{deals.length}</p>
            {deals.length === 0 && <p className="mt-2 text-xs text-slate-400">Сделок пока нет</p>}
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Выиграно / сумма</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-700">{won}</p>
            <p className="text-sm text-slate-600">{formatMoney(totalAmount)}</p>
          </Card>
        </div>
      )}
    </>
  );
}
