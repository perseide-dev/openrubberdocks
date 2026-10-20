import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom';

import { ProtectedRoute } from '@routes/ProtectedRoute';
import { PublicRoute } from '@routes/PublicRoute';
import { ProtectedLayout } from '@layout/ProtectedLayout';
import { LoginPage } from '@features/auth/pages/LoginPage';
import { DashboardRouter } from '@features-workspaces/manager/routes/Router';
import { FilesRouter } from '@features-workspaces/files/routes/Router';
import { AdminRouter } from '@features/admin/routes/Router';

const protectedModules = [
  ...DashboardRouter,
  ...FilesRouter,
  ...AdminRouter,
];

const router = createBrowserRouter([
  {
    // Envoltorio global
    element: (
      <>
        {/* <AutoPageviewTracker /> */}
        {/* <ThemeInitializer /> */}
        <Outlet />
      </>
    ),
    children: [
      // 1. Rutas Públicas
      {
        element: <PublicRoute />,
        children: [
          {
            path: "/login",
            element: <LoginPage />
          }
        ]
      },

      // 2. Rutas Protegidas y su Layout
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProtectedLayout navRoutes={protectedModules} />,
            children: protectedModules
          }
        ]
      },

      // 3. Ruta Fallback (Catch-all)
      {
        path: "*",
        element: <Navigate to="/workspaces" replace />
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
