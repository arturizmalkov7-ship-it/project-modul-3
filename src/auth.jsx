import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchMyProfile } from './lib/crmApi.js';
import { supabase, supabaseConfigError } from './lib/supabase.js';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth вне AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!supabaseConfigError);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    const bootstrap = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(currentSession);
      if (currentSession?.user?.id) {
        try {
          const me = await fetchMyProfile(currentSession.user.id);
          if (mounted) setProfile(me);
        } catch {
          if (mounted) setProfile(null);
        }
      }
      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user?.id) {
        try {
          const me = await fetchMyProfile(nextSession.user.id);
          if (mounted) setProfile(me);
        } catch {
          if (mounted) setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password, autoSignUp = false }) => {
    if (!supabase) throw new Error(supabaseConfigError);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return;

    if (!autoSignUp || error.message !== 'Invalid login credentials') {
      throw error;
    }

    const { error: signUpError, data: signUpData } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      throw signUpError;
    }

    // If email confirmation is required, Supabase may not return an active session.
    // In this case user must confirm email and then sign in again.
    if (!signUpData.session) {
      throw new Error('Пользователь создан. Подтвердите email в почте и повторите вход.');
    }
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(
    () => ({
      isAuthed: !!session,
      session,
      user: session?.user || null,
      profile,
      loading,
      configError: supabaseConfigError,
      login,
      logout,
      refreshProfile: async () => {
        if (!supabase) return;
        if (!session?.user?.id) return;
        const me = await fetchMyProfile(session.user.id);
        setProfile(me);
      },
    }),
    [session, profile, loading]
  );
  if (supabaseConfigError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">Нужна настройка Supabase</h1>
          <p className="mt-2 text-sm text-amber-800">{supabaseConfigError}</p>
          <p className="mt-2 text-sm text-amber-800">
            Создайте файл <code>.env</code> в корне проекта на основе <code>.env.example</code>, затем
            перезапустите dev-сервер.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth() {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Проверяем сессию...</div>;
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}

export function RequireRole({ allowedRoles }) {
  const { profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-sm text-slate-500">Проверяем права...</div>;
  if (!profile || !allowedRoles.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
