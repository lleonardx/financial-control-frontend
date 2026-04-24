import { Navigate, Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { AccountsPage } from '../pages/AccountsPage';
import { DashboardPage } from '../pages/Dashboard';

export function MainRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}