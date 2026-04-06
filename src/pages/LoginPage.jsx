import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Card } from '../components/ui.jsx';

export default function LoginPage() {
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
        <p className="mt-1 text-sm text-slate-500">Демо: любой логин и пароль — вход без проверки.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              placeholder="you@company.ru"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Пароль</label>
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
