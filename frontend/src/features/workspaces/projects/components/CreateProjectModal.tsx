import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
} from '@mui/material';
import { useCreateProjectModal } from '@features-workspaces/projects/hooks/useWorkspaceProjects';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import type { CreateProjectModalProps } from '@features-workspaces/projects/types/project.types';

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    open,
    onClose,
    workspaceUuid,
}) => {
    const {
        name,
        setName,
        description,
        setDescription,
        startDate,
        setStartDate,
        targetDate,
        setTargetDate,
        handleSubmit,
        isPending,
    } = useCreateProjectModal(workspaceUuid, onClose);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {PROJECT_LABELS.NEW_PROJECT}
                </DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        paddingTop: '16px !important',
                    }}
                >
                    <TextField
                        required
                        fullWidth
                        label="Project Name"
                        placeholder="e.g. Mobile App Redesign"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        placeholder="Project scope and goals..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Target Due Date"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ padding: 2.5 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || !name.trim()}
                        startIcon={
                            isPending ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        Create
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
