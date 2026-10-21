import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActionArea,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { useNavigate } from 'react-router-dom';
import {
    useProjectFilesService,
    useLinkProjectFileService,
    useUnlinkProjectFileService,
} from '@features-workspaces/projects/services/project.service';
import { useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';
import { files as filesRoutes } from '@features-workspaces/files/routes/routes';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import type { ProjectFilesTabProps } from '@features-workspaces/projects/types/project.types';

export const ProjectFilesTab: React.FC<ProjectFilesTabProps> = ({
    projectUuid,
    workspaceUuid,
    canManage,
}) => {
    const navigate = useNavigate();
    const { data: linkedFiles = [], isLoading } = useProjectFilesService(projectUuid);
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const linkMutation = useLinkProjectFileService();
    const unlinkMutation = useUnlinkProjectFileService();

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedFileUuid, setSelectedFileUuid] = useState('');

    // Available files not yet linked
    const linkedUuids = new Set(linkedFiles.map((l) => l.fileUuid));
    const unlinkedFiles = workspaceFiles.filter((f) => !linkedUuids.has(f.uuid));

    const handleLinkFile = async () => {
        if (!selectedFileUuid) return;
        await linkMutation.mutateAsync({
            projectUuid,
            payload: { fileUuid: selectedFileUuid },
        });
        setSelectedFileUuid('');
        setIsLinkModalOpen(false);
    };

    const handleUnlink = async (fileUuid: string) => {
        await unlinkMutation.mutateAsync({
            projectUuid,
            fileUuid,
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                >
                    {`// LINKED_FILES (${linkedFiles.length})`}
                </Typography>

                {canManage && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setIsLinkModalOpen(true)}
                    >
                        Link File
                    </Button>
                )}
            </Box>

            {isLoading ? (
                <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                >
                    {PROJECT_LABELS.LOADING}
                </Typography>
            ) : linkedFiles.length === 0 ? (
                <Box sx={{ padding: 4, textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                        {PROJECT_LABELS.NO_FILES}
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 2,
                    }}
                >
                    {linkedFiles.map((link) => (
                        <Card key={link.uuid} variant="outlined">
                            <CardActionArea
                                onClick={() =>
                                    navigate(
                                        filesRoutes.view.build(
                                            workspaceUuid,
                                            link.fileUuid,
                                        ),
                                    )
                                }
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <ArticleOutlinedIcon />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {link.file?.title || 'Untitled Document'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {`Attached ${new Date(link.attachedAt).toLocaleDateString()}`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {canManage && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnlink(link.fileUuid);
                                            }}
                                        >
                                            <LinkOffIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Link Existing Workspace File Modal */}
            <Dialog
                open={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    // LINK WORKSPACE FILE
                </DialogTitle>
                <DialogContent sx={{ paddingTop: '16px !important' }}>
                    {unlinkedFiles.length === 0 ? (
                        <Typography
                            variant="body2"
                            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                            // ALL_WORKSPACE_FILES_ALREADY_LINKED
                        </Typography>
                    ) : (
                        <TextField
                            select
                            fullWidth
                            label="Select Document"
                            value={selectedFileUuid}
                            onChange={(e) => setSelectedFileUuid(e.target.value)}
                        >
                            {unlinkedFiles.map((f) => (
                                <MenuItem key={f.uuid} value={f.uuid}>
                                    {f.title || 'Untitled'}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </DialogContent>
                <DialogActions sx={{ padding: 2 }}>
                    <Button onClick={() => setIsLinkModalOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleLinkFile}
                        disabled={!selectedFileUuid || linkMutation.isPending}
                    >
                        Link
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
