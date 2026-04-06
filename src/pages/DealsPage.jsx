import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { DEAL_STAGES } from '../mockData.js';
import { Card, EmptyState, PageTitle, formatMoney, stageMeta } from '../components/ui.jsx';

export default function DealsPage() {
  const { deals, setDeals } = useOutletContext();
  const [mode, setMode] = useState('list');

  const handleDeleteDeal = (dealId, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!window.confirm('Удалить сделку?')) return;
    setDeals((list) => list.filter((d) => d.id !== dealId));
  };

  return (
    <>
      <PageTitle
        title="Сделки"
        subtitle="Список или канбан по этапам"
        actions={
          <>
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setMode('list')}
                className={`rounded-md px-3 py-1.5 ${
                  mode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Список
              </button>
              <button
                type="button"
                onClick={() => setMode('funnel')}
                className={`rounded-md px-3 py-1.5 ${
                  mode === 'funnel' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Воронка
              </button>
            </div>
            <Link
              to="/deals/new"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              + Новая сделка
            </Link>
          </>
        }
      />

      {deals.length === 0 ? (
        <EmptyState
          title="Сделок пока нет"
          description="Создайте сделку и привяжите её к клиенту. Без клиентов сначала добавьте контрагента."
        >
          <Link
            to="/deals/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Новая сделка
          </Link>
          <Link
            to="/clients/new"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Новый клиент
          </Link>
        </EmptyState>
      ) : mode === 'list' ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Этап</th>
                <th className="w-24 px-4 py-3 font-medium" aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const st = stageMeta(d.stage);
                return (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <Link to={`/deals/${d.id}`} className="font-medium text-emerald-700 hover:underline">
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.clientName}</td>
                    <td className="px-4 py-3">{formatMoney(d.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDeal(d.id, e)}
                        className="text-sm font-medium text-rose-600 hover:text-rose-800"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-100/80 p-3"
              >
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {stage.label}
                </h3>
                {stageDeals.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-400">
                    Нет сделок
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {stageDeals.map((d) => (
                      <li key={d.id}>
                        <div className="relative rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-emerald-300">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDeal(d.id, e)}
                            className="absolute right-2 top-2 text-xs font-medium text-rose-600 hover:text-rose-800"
                            aria-label="Удалить сделку"
                          >
                            ×
                          </button>
                          <Link to={`/deals/${d.id}`} className="block pr-6">
                            <span className="font-medium text-slate-900">{d.title}</span>
                            <p className="mt-1 text-xs text-slate-500">{d.clientName}</p>
                            <p className="mt-1 text-sm font-semibold text-emerald-700">
                              {formatMoney(d.amount)}
                            </p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
