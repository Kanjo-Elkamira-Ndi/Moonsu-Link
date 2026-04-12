import { Navigate, Route, Routes } from 'react-router-dom'; // ← remove BrowserRouter
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/pages/LoginPage';
import { LandingPage } from './components/pages/LandingPage';
import { DashboardLayout } from './components/pages/DashboardLayout';
import { ListingsPage } from './components/pages/ListingsPage';
import { PricesPage } from './components/pages/PricesPage';
import { UsersPage } from './components/pages/UsersPage';
import { AlertsPage } from './components/pages/AlertsPage';

export default function App() {
  const { token, login, logout, error, loading, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/listings" replace />
          ) : (
            <LoginPage onLogin={login} error={error} loading={loading} />
          )
        }
      />

      {isAuthenticated ? (
        <Route element={<DashboardLayout token={token!} onLogout={logout} />}>
          <Route path="/listings" element={<ListingsPage token={token!} />} />
          <Route path="/prices"   element={<PricesPage token={token!} />} />
          <Route path="/users"    element={<UsersPage token={token!} />} />
          <Route path="/alerts"   element={<AlertsPage token={token!} />} />
        </Route>
      ) : (
        <>
          <Route path="/listings" element={<Navigate to="/login" replace />} />
          <Route path="/prices"   element={<Navigate to="/login" replace />} />
          <Route path="/users"    element={<Navigate to="/login" replace />} />
          <Route path="/alerts"   element={<Navigate to="/login" replace />} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}