import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import FlowBuilder from './features/flow-builder/FlowBuilder';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPricing from './pages/admin/AdminPricing';
import LiveMonitor from './pages/LiveMonitor';
import LandingPage from './pages/LandingPage';
import GetStartedWizard from './pages/GetStartedWizard';
import AntiBlockGuide from './pages/AntiBlockGuide';
import SessionTimeoutHandler from './components/SessionTimeoutHandler';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  // Si está autenticado pero NO está autorizado en beta y NO es admin, redirigir al portal de autorización
  if (user && !user.betaAuthorized && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN') {
    return <Navigate to="/get-started?step=authorize" replace />;
  }
  
  return children;
};

function App() {
  const token = useAuthStore((state) => state.token);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  return (
    <Router>
      <SessionTimeoutHandler />
      <Routes>
        {/* Rutas Públicas de la Plataforma */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/get-started" element={<GetStartedWizard />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* Rutas Protegidas bajo Layout Compartido */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-monitor" element={<LiveMonitor />} />
          <Route path="/security" element={<AntiBlockGuide />} />
          <Route path="/bots" element={<Navigate to="/dashboard" replace />} />
          <Route path="/bot/:id/flow" element={<FlowBuilder />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/pricing" element={<AdminPricing />} />
        </Route>

        {/* Fallback general de rutas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
