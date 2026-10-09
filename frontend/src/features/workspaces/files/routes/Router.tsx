import { FileEditorPage } from '@features/workspaces/files/pages/FileEditorPage';
import type { RouteObject } from 'react-router-dom';
import { files } from '@features/workspaces/files/routes/routes';

export const FilesRouter: RouteObject[] = [
    {
        path: files.create.route,
        element: <FileEditorPage />,
    },
];
