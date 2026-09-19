import { DashboardPage } from '@features/projects/pages/DashboardPage';
import type { RouteObject } from 'react-router-dom';
import { dashboardRoutes } from '@features/projects/routes/routes';


export const DashboardRouter: RouteObject[] = [
    {
        path: dashboardRoutes.dashboard,
        element: <DashboardPage />
    },
]