import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { RegisterPage } from '../pages/REgisterPage';
import { MainLayout } from '../layouts/MainLayout';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MainLayout />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}