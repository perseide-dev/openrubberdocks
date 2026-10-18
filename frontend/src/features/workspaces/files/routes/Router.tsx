import { FileEditorPage } from '@features/workspaces/files/pages/FileEditorPage';
import { FileViewPage } from '@features/workspaces/files/pages/FileViewPage';
import { FileEditPage } from '@features/workspaces/files/pages/FileEditPage';
import type { RouteObject } from 'react-router-dom';
import { files } from '@features/workspaces/files/routes/routes';
import { ScopedRouteGuard } from '@routes/ScopedRouteGuard';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';

export const FilesRouter: RouteObject[] = [
    {
        path: files.create.route,
        element: (
            <ScopedRouteGuard requiredPermission={BASE_PERMISSIONS_ACTIONS.DOCUMENT_WRITE}>
                <FileEditorPage />
            </ScopedRouteGuard>
        ),
    },
    {
        path: files.view.route,
        element: (
            <ScopedRouteGuard requiredPermission={BASE_PERMISSIONS_ACTIONS.DOCUMENT_READ}>
                <FileViewPage />
            </ScopedRouteGuard>
        ),
    },
    {
        path: files.edit.route,
        element: (
            <ScopedRouteGuard requiredPermission={BASE_PERMISSIONS_ACTIONS.DOCUMENT_WRITE}>
                <FileEditPage />
            </ScopedRouteGuard>
        ),
    },
];
