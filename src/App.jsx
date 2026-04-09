import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth, RequireRole } from './auth.jsx';
import AppShell from './layout/AppShell.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import ClientFormPage from './pages/ClientFormPage.jsx';
import ClientsListPage from './pages/ClientsListPage.jsx';
import ClientViewPage from './pages/ClientViewPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DealFormPage from './pages/DealFormPage.jsx';
import DealsPage from './pages/DealsPage.jsx';
import DealViewPage from './pages/DealViewPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

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
            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
