import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';
import { FileEditor } from '@features/workspaces/files/components/FileEditor';
import { useFileCreation } from '@features/workspaces/files/hooks/useFileCreation';

export function FileEditorPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const workspaceUuid = uuid ?? '';

    const { title, errorMessage, isSaving, blockEditor, handleTitleChange, handleSave } =
        useFileCreation(workspaceUuid);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title="Create File"
                subtitle={`// ${workspaceUuid}`}
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/workspaces/${workspaceUuid}`)}
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
