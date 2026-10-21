import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ConfirmModal } from '@components/ui';
import { useFileRevisions } from '@features-workspaces/files/hooks/useFileRevisions';
import { RevisionItemCard } from '@features-workspaces/files/components/RevisionItemCard';
import { REVISION_LABELS } from '@features-workspaces/files/constants/revision.constants';
import type { RevisionHistoryDrawerProps } from '@features-workspaces/files/types/revision.types';

export const RevisionHistoryDrawer: React.FC<RevisionHistoryDrawerProps> = ({
    open,
    onClose,
    fileUuid,
    canRestore,
}) => {
    const {
        revisions,
        isLoading,
        selectedRevision,
        isConfirmOpen,
        isRestoring,
        handleOpenConfirm,
        handleCloseConfirm,
        handleConfirmRestore,
    } = useFileRevisions(fileUuid);

    const confirmDescription = selectedRevision
        ? `Are you sure you want to restore the document to "${selectedRevision.title || 'Untitled'}" (${new Date(selectedRevision.createdAt).toLocaleString()})? Current content will be archived into a new audit checkpoint automatically.`
        : REVISION_LABELS.CONFIRM_DESCRIPTION;

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
            >
                <Box
                    sx={{
                        width: { xs: '100vw', sm: 440 },
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                                {REVISION_LABELS.DRAWER_TITLE}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                            >
                                {REVISION_LABELS.DRAWER_SUBTITLE}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} size="small" aria-label="close">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {isLoading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 4,
                                    gap: 2,
                                }}
                            >
                                <CircularProgress size={28} />
                                <Typography
                                    variant="caption"
                                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                                >
                                    {REVISION_LABELS.LOADING}
                                </Typography>
                            </Box>
                        ) : revisions.length === 0 ? (
                            <Box sx={{ padding: 4, textAlign: 'center' }}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                                >
                                    {REVISION_LABELS.NO_REVISIONS}
                                </Typography>
                            </Box>
                        ) : (
                            revisions.map((rev, index) => (
                                <React.Fragment key={rev.uuid}>
                                    <RevisionItemCard
                                        revision={rev}
                                        canRestore={canRestore}
                                        isRestoring={isRestoring}
                                        onRestoreClick={handleOpenConfirm}
                                    />
                                    {index < revisions.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        )}
                    </Box>
                </Box>
            </Drawer>

            <ConfirmModal
                open={isConfirmOpen}
                title={REVISION_LABELS.CONFIRM_TITLE}
                description={confirmDescription}
                isLoading={isRestoring}
                onConfirm={handleConfirmRestore}
                onClose={handleCloseConfirm}
            />
        </>
    );
};
