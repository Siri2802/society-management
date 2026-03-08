import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import Login from './pages/auth/Login';
import { Register, ForgotPassword } from './pages/auth/AuthPages';
import Dashboard from './pages/dashboard/Dashboard';
import Visitors from './pages/visitors/Visitors';
import Maintenance from './pages/maintenance/Maintenance';
import Finance from './pages/finance/Finance';
import Communication from './pages/communication/Communication';
import Admin from './pages/admin/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/finance" element={<ProtectedRoute roles={['resident', 'management']}><Finance /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['management']}><Admin /></ProtectedRoute>} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
