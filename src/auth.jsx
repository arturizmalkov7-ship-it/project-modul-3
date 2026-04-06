import { createContext, useContext, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth вне AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
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

export function RequireAuth() {
  const { isAuthed } = useAuth();
  const loc = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
