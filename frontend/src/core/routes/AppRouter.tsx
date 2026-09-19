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
import { DashboardPage } from '@features/projects/pages/DashboardPage';

// Importa tus componentes globales si los tienes
// import { AutoPageviewTracker } from '...';
// import { ThemeInitializer } from '...';

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
            element: <ProtectedLayout />,
            children: [
              {
                path: "/dashboard",
                element: <DashboardPage />
              },
            ]
          }
        ]
      },

      // 3. Ruta Fallback (Catch-all)
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
