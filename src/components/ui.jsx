import { DEAL_STAGES } from '../mockData.js';

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description, children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 px-6 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {children && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{children}</div>
      )}
    </div>
  );
}

export function stageMeta(stageId) {
  return DEAL_STAGES.find((s) => s.id === stageId) || DEAL_STAGES[0];
}

export function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatShortDate(iso) {
  if (!iso || typeof iso !== 'string') return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}
