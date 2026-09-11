import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@routes/ProtectedRoute';
import { PublicRoute } from '@routes/PublicRoute';
import { ProtectedLayout } from '@layout/ProtectedLayout';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { DashboardPage } from '@features/dashboard/pages/DashboardPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (only accessible when not logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes (require authenticated session) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workspaces" element={<DashboardPage />} />
            <Route path="/settings/rbac" element={<DashboardPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
