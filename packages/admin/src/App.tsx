import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/pages/LoginPage';
import DashboardLayout from './components/pages/DashboardLayout';
import PricesPage from './components/pages/PricesPage';
import ListingsPage from './components/pages/ListingsPage';
import UsersPage from './components/pages/UsersPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPage />;

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/prices" replace />} />
        <Route path="/prices" element={<PricesPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </DashboardLayout>
  );
}
