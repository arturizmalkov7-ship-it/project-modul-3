import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchMyProfile, updateMyProfile } from './lib/crmApi.js';
import { supabase, supabaseConfigError } from './lib/supabase.js';

const AuthContext = createContext(null);
const ENABLE_DEMO_AUTH = import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true';
const DEMO_AUTH_KEY = 'crm_demo_auth';
const DEMO_PROFILE_KEY = 'crm_demo_profile';
const DEMO_EMAIL = 'manager@example.com';
const DEMO_PASSWORD = 'Passw0rd123!';
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_PROFILE = {
  id: DEMO_USER_ID,
  name: 'Demo Manager',
  email: DEMO_EMAIL,
  phone: '+7 (900) 000-00-00',
  position: 'Sales manager',
  role: 'manager',
  active: true,
};

function createDemoSession() {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
    },
  };
}

function readDemoProfile() {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return DEMO_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEMO_PROFILE, ...parsed, id: DEMO_USER_ID, email: DEMO_EMAIL };
  } catch {
    return DEMO_PROFILE;
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth вне AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [isDemo, setIsDemo] = useState(() => ENABLE_DEMO_AUTH && localStorage.getItem(DEMO_AUTH_KEY) === '1');
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!supabaseConfigError);

  useEffect(() => {
    if (isDemo) {
      setSession(createDemoSession());
      setProfile(readDemoProfile());
      setLoading(false);
      return;
    }
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
  }, [isDemo]);

  const login = async ({ email, password, autoSignUp = false }) => {
    if (!supabase) throw new Error(supabaseConfigError);
    const normalizedEmail = email?.trim().toLowerCase();
    const isDemoCredentials =
      ENABLE_DEMO_AUTH && normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      localStorage.removeItem(DEMO_AUTH_KEY);
      setIsDemo(false);
      return;
    }

    if (isDemoCredentials) {
      // Fallback for workshops/local demos when Supabase auth is unavailable or throttled.
      localStorage.setItem(DEMO_AUTH_KEY, '1');
      setIsDemo(true);
      setSession(createDemoSession());
      setProfile(readDemoProfile());
      setLoading(false);
      return;
    }

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
    if (isDemo) {
      localStorage.removeItem(DEMO_AUTH_KEY);
      localStorage.removeItem(DEMO_PROFILE_KEY);
      localStorage.removeItem('crm_demo_clients');
      localStorage.removeItem('crm_demo_deals');
      setIsDemo(false);
      setSession(null);
      setProfile(null);
      return;
    }
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
      isDemo,
      configError: supabaseConfigError,
      login,
      logout,
      refreshProfile: async () => {
        if (isDemo) {
          setProfile((prev) => prev || DEMO_PROFILE);
          return;
        }
        if (!supabase) return;
        if (!session?.user?.id) return;
        const me = await fetchMyProfile(session.user.id);
        setProfile(me);
      },
      saveProfile: async (payload) => {
        if (isDemo) {
          const nextProfile = { ...DEMO_PROFILE, ...payload, id: DEMO_USER_ID, email: DEMO_EMAIL };
          localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(nextProfile));
          setProfile(nextProfile);
          return nextProfile;
        }
        if (!supabase) throw new Error(supabaseConfigError);
        if (!session?.user?.id) throw new Error('Нет активной сессии.');
        const updated = await updateMyProfile(session.user.id, payload);
        setProfile(updated);
        return updated;
      },
    }),
    [session, profile, loading, isDemo]
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
