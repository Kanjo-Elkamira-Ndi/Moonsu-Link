import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardLayout } from './components/pages/DashboardLayout';
import { ListingsPage } from './components/pages/ListingsPage';
import { PricesPage } from './components/pages/PricesPage';
import { UsersPage } from './components/pages/UsersPage';

export default function App() {
  const { token, login, logout, error, loading, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} error={error} loading={loading} />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout onLogout={logout} />}>
        <Route index element={<Navigate to="/listings" replace />} />
        <Route path="/listings" element={<ListingsPage token={token!} />} />
        <Route path="/prices"   element={<PricesPage   token={token!} />} />
        <Route path="/users"    element={<UsersPage     token={token!} />} />
      </Route>
    </Routes>
  );
}
