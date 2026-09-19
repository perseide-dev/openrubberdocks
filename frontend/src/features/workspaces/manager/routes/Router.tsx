import { DashboardPage } from '@features-workspaces/manager/pages/DashboardPage';
import type { RouteObject } from 'react-router-dom';
import { workspace } from '@features-workspaces/manager/routes/routes';
import type { NavHandle } from '@utils/types/nav.types';



export const DashboardRouter: RouteObject[] = [
    {
        path: workspace.dashboard.route,
        element: <DashboardPage />,
        handle: { label: workspace.dashboard.label, icon: workspace.dashboard.icon } as NavHandle
    },
]