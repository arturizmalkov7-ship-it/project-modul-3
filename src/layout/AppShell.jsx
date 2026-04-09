import { Link, NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import {
  createClient,
  createDeal,
  deleteClient,
  deleteDeal,
  fetchClients,
  fetchDeals,
  updateClient,
  updateDeal,
} from '../lib/crmApi.js';

const DEMO_CLIENTS_KEY = 'crm_demo_clients';
const DEMO_DEALS_KEY = 'crm_demo_deals';

function readJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export default function AppShell() {
  const { logout, user, profile, isDemo } = useAuth();
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemo) {
      const today = new Date().toISOString().slice(0, 10);
      const defaultClients = [
        {
          id: 'demo-client-1',
          name: 'ООО Ромашка',
          email: 'hello@romashka.test',
          phone: '+7 (900) 111-22-33',
          company: 'Ромашка',
          note: 'Демо-клиент для обучения.',
          createdAt: today,
        },
      ];
      const defaultDeals = [
        {
          id: 'demo-deal-1',
          title: 'Внедрение CRM Lite',
          amount: 120000,
          stage: 'proposal',
          clientId: 'demo-client-1',
          clientName: 'ООО Ромашка',
          comment: 'Обсуждаем коммерческое предложение.',
          ownerId: user?.id || 'demo-user',
          updatedAt: today,
        },
      ];
      const storedClients = readJsonArray(DEMO_CLIENTS_KEY);
      const storedDeals = readJsonArray(DEMO_DEALS_KEY);
      setClients(storedClients ?? defaultClients);
      setDeals(storedDeals ?? defaultDeals);
      setError('');
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setError('');
      try {
        const [clientsData, dealsData] = await Promise.all([fetchClients(), fetchDeals()]);
        if (!mounted) return;
        setClients(clientsData);
        setDeals(dealsData);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Не удалось загрузить данные из Supabase.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDemo, user?.id]);

  useEffect(() => {
    if (!isDemo || loading) return;
    localStorage.setItem(DEMO_CLIENTS_KEY, JSON.stringify(clients));
  }, [isDemo, loading, clients]);

  useEffect(() => {
    if (!isDemo || loading) return;
    localStorage.setItem(DEMO_DEALS_KEY, JSON.stringify(deals));
  }, [isDemo, loading, deals]);

  const handleLogout = async () => {
    await logout();
  };

  const api = {
    createClient: async (payload) => {
      if (isDemo) {
        const created = {
          id: `demo-client-${crypto.randomUUID()}`,
          name: payload.name,
          email: payload.email || '',
          phone: payload.phone || '',
          company: payload.company || '',
          note: payload.note || '',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setClients((prev) => [created, ...prev]);
        return created;
      }
      const created = await createClient(payload, user.id);
      setClients((prev) => [created, ...prev]);
      return created;
    },
    updateClient: async (id, payload) => {
      if (isDemo) {
        const updated = {
          id,
          name: payload.name,
          email: payload.email || '',
          phone: payload.phone || '',
          company: payload.company || '',
          note: payload.note || '',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
        return updated;
      }
      const updated = await updateClient(id, payload);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    deleteClient: async (id) => {
      if (isDemo) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        setDeals((prev) => prev.filter((d) => d.clientId !== id));
        return;
      }
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setDeals((prev) => prev.filter((d) => d.clientId !== id));
    },
    createDeal: async (payload) => {
      if (isDemo) {
        const client = clients.find((c) => c.id === payload.clientId);
        const created = {
          id: `demo-deal-${crypto.randomUUID()}`,
          title: payload.title,
          amount: Number(payload.amount || 0),
          stage: payload.stage,
          clientId: payload.clientId,
          clientName: client?.name || '—',
          comment: payload.comment || '',
          ownerId: user?.id || 'demo-user',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setDeals((prev) => [created, ...prev]);
        return created;
      }
      const created = await createDeal(payload, user.id);
      setDeals((prev) => [created, ...prev]);
      return created;
    },
    updateDeal: async (id, payload) => {
      if (isDemo) {
        const client = clients.find((c) => c.id === payload.clientId);
        const updated = {
          id,
          title: payload.title,
          amount: Number(payload.amount || 0),
          stage: payload.stage,
          clientId: payload.clientId,
          clientName: client?.name || '—',
          comment: payload.comment || '',
          ownerId: user?.id || 'demo-user',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
        return updated;
      }
      const updated = await updateDeal(id, payload);
      setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    },
    deleteDeal: async (id) => {
      if (isDemo) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
        return;
      }
      await deleteDeal(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
    },
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
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
          {profile?.role === 'admin' && (
            <NavLink to="/admin/users" className={navClass}>
              Админ: пользователи
            </NavLink>
          )}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Выйти
          </button>
        </div>
      </aside>

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
            {profile?.role === 'admin' && (
              <Link to="/admin/users" className="text-slate-600">
                Админ
              </Link>
            )}
            <button type="button" onClick={handleLogout} className="ml-auto text-rose-600">
              Выйти
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {loading ? (
            <div className="text-sm text-slate-500">Загрузка...</div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          ) : (
            <Outlet context={{ clients, deals, api }} />
          )}
        </main>
      </div>
    </div>
  );
}
