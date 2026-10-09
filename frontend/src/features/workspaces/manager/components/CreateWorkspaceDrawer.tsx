import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    Divider,
    CircularProgress,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import type { CreateWorkspaceFormController } from '@features/workspaces/manager/hooks/useCreateWorkspaceForm';

interface CreateWorkspaceDrawerProps {
    open: boolean;
    onClose: () => void;
    form: CreateWorkspaceFormController;
}

/**
 * Presentational drawer hosting the create-workspace form.
 */
export function CreateWorkspaceDrawer({ open, onClose, form }: CreateWorkspaceDrawerProps) {
    const {
        formState,
        errorMessage,
        isSubmitting,
        handleNameChange,
        handleDescriptionChange,
        handleSubmit,
    } = form;

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                    width: { xs: '100vw', sm: 420 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 2.5,
                    }}
                >
                    <Box>
                        <Typography variant="h6" component="div">
                            Create Space
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            // DEFINE A NEW WORKSPACE
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close create workspace drawer"
                        onClick={onClose}
                        size="small"
                        disabled={isSubmitting}
                    >
                        <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Divider />

                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        padding: 3,
                        overflowY: 'auto',
                    }}
                >
                    {errorMessage && (
                        <Alert severity="error" variant="filled">
                            {errorMessage}
                        </Alert>
                    )}

                    <TextField
                        id="workspace-name-input"
                        label="// NAME"
                        placeholder="e.g. Engineering Docs"
                        value={formState.name}
                        onChange={handleNameChange}
                        disabled={isSubmitting}
                        autoFocus
                        fullWidth
                    />

                    <TextField
                        id="workspace-description-input"
                        label="// DESCRIPTION"
                        placeholder="Optional summary of this workspace"
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        disabled={isSubmitting}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Box>

                <Divider />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        padding: 2.5,
                    }}
                >
                    <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        endIcon={
                            isSubmitting ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <AddOutlinedIcon />
                            )
                        }
                    >
                        {isSubmitting ? 'Creating...' : 'Create Space'}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}
