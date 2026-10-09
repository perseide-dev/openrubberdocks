import { FileEditorPage } from '@features/workspaces/files/pages/FileEditorPage';
import { FileViewPage } from '@features/workspaces/files/pages/FileViewPage';
import { FileEditPage } from '@features/workspaces/files/pages/FileEditPage';
import type { RouteObject } from 'react-router-dom';
import { files } from '@features/workspaces/files/routes/routes';

export const FilesRouter: RouteObject[] = [
    {
        path: files.create.route,
        element: <FileEditorPage />,
    },
    {
        path: files.view.route,
        element: <FileViewPage />,
    },
    {
        path: files.edit.route,
        element: <FileEditPage />,
    },
];
