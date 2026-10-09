import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';
import { FileEditor } from '@features/workspaces/files/components/FileEditor';
import { useFileEdit } from '@features/workspaces/files/hooks/useFileEdit';

export function FileEditPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const { title, errorMessage, isSaving, blockEditor, handleTitleChange, handleSave } = useFileEdit(wsUuid, fUuid);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title="Edit File"
                subtitle={`// ${wsUuid}`}
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/workspaces/${wsUuid}/files/${fUuid}`)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button color="inherit" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save File'}
                        </Button>
                    </Box>
                }
            />
            <FileEditor
                title={title}
                errorMessage={errorMessage}
                blockEditor={blockEditor}
                onTitleChange={handleTitleChange}
            />
        </Box>
    );
}
