import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Card } from '../components/ui.jsx';

export default function LoginPage() {
  const { isAuthed, login, loading } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || '/dashboard';
  const [email, setEmail] = useState('manager@example.com');
  const [password, setPassword] = useState('Passw0rd123!');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Проверяем сессию...</div>;
  }

  if (isAuthed) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ email, password, autoSignUp: true });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Не удалось выполнить вход.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvalid = (e) => {
    e.target.setCustomValidity('не заполнено поле');
  };

  const handleInput = (e) => {
    e.target.setCustomValidity('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-slate-900">Вход в CRM</h1>
        <p className="mt-1 text-sm text-slate-500">Вход через Supabase Email/Password.</p>
        <p className="mt-1 text-xs text-slate-500">
          Пример: Email <code>manager@example.com</code>, Пароль <code>Passw0rd123!</code>
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInvalid={handleInvalid}
              onInput={handleInput}
              placeholder="you@company.ru"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInvalid={handleInvalid}
              onInput={handleInput}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {submitting ? 'Входим...' : 'Войти'}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </form>
      </Card>
    </div>
  );
}
