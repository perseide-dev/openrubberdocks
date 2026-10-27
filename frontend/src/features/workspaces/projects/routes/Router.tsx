import { ProjectDetailPage } from '@features-workspaces/projects/pages/ProjectDetailPage';
import type { RouteObject } from 'react-router-dom';
import { projectsRoutes } from '@features-workspaces/projects/routes/routes';
import { ScopedRouteGuard } from '@routes/ScopedRouteGuard';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';

export const ProjectsRouter: RouteObject[] = [
    {
        path: projectsRoutes.detail.route,
        element: (
            <ScopedRouteGuard requiredPermission={BASE_PERMISSIONS_ACTIONS.PROJECT_READ}>
                <ProjectDetailPage />
            </ScopedRouteGuard>
        ),
    },
];
