import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import {
  DEAL_STAGES,
  mockClients as initialClients,
  mockDeals as initialDeals,
  mockProfile,
  mockUsers,
} from './mockData.js';

// -----------------------------------------------------------------------------
// Контекст «авторизации»: без бэкенда — флаг в localStorage
// -----------------------------------------------------------------------------
const AuthContext = createContext(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth вне AuthProvider');
  return ctx;
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'));
  const login = () => {
    localStorage.setItem('crm_token', 'demo');
    setToken('demo');
  };
  const logout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
  };
  const value = useMemo(() => ({ isAuthed: !!token, login, logout }), [token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Защита маршрутов: неавторизованных перенаправляем на /login */
function RequireAuth() {
  const { isAuthed } = useAuth();
  const loc = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

// -----------------------------------------------------------------------------
// Общие UI-элементы
// -----------------------------------------------------------------------------
function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function PageTitle({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function stageMeta(stageId) {
  return DEAL_STAGES.find((s) => s.id === stageId) || DEAL_STAGES[0];
}

function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
}

// -----------------------------------------------------------------------------
// Каркас: боковая навигация + область страницы
// -----------------------------------------------------------------------------
function AppShell() {
  const { logout } = useAuth();
  const [clients, setClients] = useState(initialClients);
  const [deals, setDeals] = useState(initialDeals);

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-100 px-4 py-5">
          <span className="text-lg font-bold text-emerald-700">CRM Lite</span>
          <p className="text-xs text-slate-500">малый бизнес</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <NavLink to="/dashboard" className={navClass}>
            Дашборд
          </NavLink>
          <NavLink to="/clients" className={navClass}>
            Клиенты
          </NavLink>
          <NavLink to="/deals" className={navClass}>
            Сделки
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            Профиль
          </NavLink>
          <NavLink to="/admin/users" className={navClass}>
            Админ: пользователи
          </NavLink>
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Мобильная шапка с теми же ссылками */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/dashboard" className="text-emerald-700 font-medium">
              Дашборд
            </Link>
            <Link to="/clients" className="text-slate-600">
              Клиенты
            </Link>
            <Link to="/deals" className="text-slate-600">
              Сделки
            </Link>
            <Link to="/settings" className="text-slate-600">
              Профиль
            </Link>
            <Link to="/admin/users" className="text-slate-600">
              Админ
            </Link>
            <button
              type="button"
              onClick={logout}
              className="ml-auto text-rose-600"
            >
              Выйти
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet context={{ clients, setClients, deals, setDeals }} />
        </main>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Страница входа (без каркаса)
// -----------------------------------------------------------------------------
function LoginPage() {
  const { isAuthed, login } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/dashboard';

  if (isAuthed) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-900">Вход в CRM</h1>
        <p className="mt-1 text-sm text-slate-500">
          Демо: любой логин и пароль — вход без проверки.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@company.ru"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Пароль
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Войти
          </button>
        </form>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Дашборд (опциональная сводка)
// -----------------------------------------------------------------------------
function DashboardPage() {
  const { clients, deals } = useOutletContext();
  const totalAmount = deals.reduce((s, d) => s + d.amount, 0);
  const won = deals.filter((d) => d.stage === 'won').length;

  return (
    <>
      <PageTitle
        title="Дашборд"
        subtitle="Краткая сводка по моковым данным"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Клиенты</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {clients.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Сделки всего</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {deals.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Выиграно / сумма</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-700">{won}</p>
          <p className="text-sm text-slate-600">{formatMoney(totalAmount)}</p>
        </Card>
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Клиенты: список
// -----------------------------------------------------------------------------
function ClientsListPage() {
  const { clients } = useOutletContext();
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
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Компания</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <Link
                    to={`/clients/${c.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.email}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                <td className="px-4 py-3 text-slate-600">{c.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// -----------------------------------------------------------------------------
// Клиент: просмотр
// -----------------------------------------------------------------------------
function ClientViewPage() {
  const { id } = useParams();
  const { clients } = useOutletContext();
  const client = clients.find((c) => c.id === id);
  if (!client) {
    return <p className="text-slate-500">Клиент не найден.</p>;
  }
  return (
    <>
      <PageTitle
        title={client.name}
        subtitle={`Создан: ${client.createdAt}`}
        actions={
          <>
            <Link
              to={`/clients/${id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Редактировать
            </Link>
            <Link
              to="/clients"
              className="text-sm text-emerald-700 hover:underline"
            >
              ← К списку
            </Link>
          </>
        }
      />
      <Card className="max-w-2xl space-y-3 text-sm">
        <div>
          <span className="text-slate-500">Email:</span>{' '}
          <span className="text-slate-900">{client.email}</span>
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

// -----------------------------------------------------------------------------
// Клиент: форма создания / редактирования
// -----------------------------------------------------------------------------
function ClientFormPage() {
  const { id } = useParams();
  const location = useLocation();
  // /clients/new — отдельный маршрут без :id в params
  const isNew = location.pathname === '/clients/new';
  const navigate = useNavigate();
  const { clients, setClients } = useOutletContext();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNew) {
      const newId = `c${Date.now()}`;
      setClients((list) => [
        ...list,
        {
          ...form,
          id: newId,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      navigate(`/clients/${newId}`);
    } else if (existing) {
      setClients((list) =>
        list.map((c) =>
          c.id === id ? { ...c, ...form } : c
        )
      );
      navigate(`/clients/${id}`);
    }
  };

  if (!isNew && !existing) {
    return <p className="text-slate-500">Клиент не найден.</p>;
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
                {field === 'name'
                  ? 'Название / ФИО'
                  : field === 'company'
                    ? 'Компания'
                    : field}
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
            <label className="block text-sm font-medium text-slate-700">
              Заметка
            </label>
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

// -----------------------------------------------------------------------------
// Сделки: переключение «список» / «воронка»
// -----------------------------------------------------------------------------
function DealsPage() {
  const { deals } = useOutletContext();
  const [mode, setMode] = useState('list'); // 'list' | 'funnel'

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
                  mode === 'list'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Список
              </button>
              <button
                type="button"
                onClick={() => setMode('funnel')}
                className={`rounded-md px-3 py-1.5 ${
                  mode === 'funnel'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
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

      {mode === 'list' ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Этап</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const st = stageMeta(d.stage);
                return (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/deals/${d.id}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {d.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.clientName}</td>
                    <td className="px-4 py-3">{formatMoney(d.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {DEAL_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-100/80 p-3"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stage.label}
              </h3>
              <ul className="space-y-2">
                {deals
                  .filter((d) => d.stage === stage.id)
                  .map((d) => (
                    <li key={d.id}>
                      <Link
                        to={`/deals/${d.id}`}
                        className="block rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-emerald-300"
                      >
                        <span className="font-medium text-slate-900">
                          {d.title}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          {d.clientName}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          {formatMoney(d.amount)}
                        </p>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// Сделка: просмотр
// -----------------------------------------------------------------------------
function DealViewPage() {
  const { id } = useParams();
  const { deals } = useOutletContext();
  const deal = deals.find((d) => d.id === id);
  if (!deal) {
    return <p className="text-slate-500">Сделка не найдена.</p>;
  }
  const st = stageMeta(deal.stage);
  return (
    <>
      <PageTitle
        title={deal.title}
        subtitle={`Обновлено: ${deal.updatedAt}`}
        actions={
          <>
            <Link
              to={`/deals/${id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Редактировать
            </Link>
            <Link to="/deals" className="text-sm text-emerald-700 hover:underline">
              ← К сделкам
            </Link>
          </>
        }
      />
      <Card className="max-w-2xl space-y-3 text-sm">
        <div>
          <span className="text-slate-500">Сумма:</span>{' '}
          <span className="text-lg font-semibold text-slate-900">
            {formatMoney(deal.amount)}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Этап:</span>{' '}
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}
          >
            {st.label}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Клиент:</span>{' '}
          <Link
            to={`/clients/${deal.clientId}`}
            className="text-emerald-700 hover:underline"
          >
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

// -----------------------------------------------------------------------------
// Сделка: форма создания / редактирования
// -----------------------------------------------------------------------------
function DealFormPage() {
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
    return <p className="text-slate-500">Сделка не найдена.</p>;
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
            <label className="block text-sm font-medium text-slate-700">
              Название
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Сумма (₽)
            </label>
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
            <label className="block text-sm font-medium text-slate-700">
              Этап
            </label>
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
            <label className="block text-sm font-medium text-slate-700">
              Клиент
            </label>
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
            <label className="block text-sm font-medium text-slate-700">
              Комментарий
            </label>
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

// -----------------------------------------------------------------------------
// Настройки профиля (локальное состояние, без сохранения на сервер)
// -----------------------------------------------------------------------------
function SettingsPage() {
  const [profile, setProfile] = useState(mockProfile);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('В демо данные не отправляются. Подключите API для сохранения.');
  };

  return (
    <>
      <PageTitle
        title="Настройки профиля"
        subtitle="Редактирование отображается только в браузере до перезагрузки"
      />
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone', 'position'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 capitalize">
                {field === 'name'
                  ? 'Имя'
                  : field === 'position'
                    ? 'Должность'
                    : field}
              </label>
              <input
                name={field}
                value={profile[field]}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ))}
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Сохранить (демо)
          </button>
        </form>
      </Card>
    </>
  );
}

// -----------------------------------------------------------------------------
// Админ: пользователи (опционально, только просмотр моков)
// -----------------------------------------------------------------------------
function AdminUsersPage() {
  return (
    <>
      <PageTitle
        title="Пользователи"
        subtitle="Список для администратора (моковые данные)"
      />
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
    </>
  );
}

// -----------------------------------------------------------------------------
// Корневой роутер приложения
// -----------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsListPage />} />
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id" element={<ClientViewPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/new" element={<DealFormPage />} />
            <Route path="/deals/:id" element={<DealViewPage />} />
            <Route path="/deals/:id/edit" element={<DealFormPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
