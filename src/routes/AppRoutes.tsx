import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { MainRoutes } from './MainRoutes';
import { RegisterPage } from '../pages/REgisterPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<MainRoutes />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}