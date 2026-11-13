import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Chip,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import type {
    InternalLinkBlockMeta,
    RichBlockSharedProps,
} from '@features-workspaces/files/types/block.types';
import type { InternalLinkCandidate } from '@features-workspaces/files/types/storage.types';

export function InternalLinkBlockView({
    block,
    readOnly = false,
    workspaceUuid = '',
    mentionCandidates = [],
    onUpdateProperties,
}: RichBlockSharedProps) {
    const navigate = useNavigate();
    const linkMeta = (block.properties?.internalLink ?? {}) as InternalLinkBlockMeta;
    const [searchQuery, setSearchQuery] = useState('');
    const [isSelecting, setIsSelecting] = useState(!linkMeta.targetUuid);

    const filteredCandidates = useMemo(() => {
        const q = searchQuery.trim().replace(/^(\[\[|@)/, '').toLowerCase();
        if (!q) return mentionCandidates.slice(0, 12);
        return mentionCandidates
            .filter(
                (item) =>
                    item.targetTitle.toLowerCase().includes(q) ||
                    item.subtitle.toLowerCase().includes(q),
            )
            .slice(0, 12);
    }, [mentionCandidates, searchQuery]);

    const handleSelectCandidate = (candidate: InternalLinkCandidate) => {
        onUpdateProperties?.(
            {
                internalLink: {
                    targetType: candidate.targetType,
                    targetUuid: candidate.targetUuid,
                    targetTitle: candidate.targetTitle,
                    projectUuid: candidate.projectUuid,
                    subtitle: candidate.subtitle,
                },
            },
            candidate.targetTitle,
        );
        setIsSelecting(false);
    };

    const handleNavigate = () => {
        if (!workspaceUuid || !linkMeta.targetUuid) return;
        if (linkMeta.targetType === 'task' && linkMeta.projectUuid) {
            navigate(`/workspaces/${workspaceUuid}/projects/${linkMeta.projectUuid}`);
            return;
        }
        navigate(`/workspaces/${workspaceUuid}/files/${linkMeta.targetUuid}`);
    };

    return (
        <Paper
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, padding: 1.5, width: '100%' }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        size="small"
                        variant="outlined"
                        icon={
                            linkMeta.targetType === 'task' ? (
                                <AssignmentTurnedInOutlinedIcon fontSize="small" />
                            ) : (
                                <DescriptionOutlinedIcon fontSize="small" />
                            )
                        }
                        label={
                            linkMeta.targetType === 'task'
                                ? '// @TASK_MENTION'
                                : '// [[DOCUMENT_LINK]]'
                        }
                    />
                    <Typography variant="subtitle2">
                        {linkMeta.targetTitle || block.content || '// UNLINKED_REFERENCE'}
                    </Typography>
                    {linkMeta.subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            ({linkMeta.subtitle})
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {linkMeta.targetUuid && (
                        <Button
                            size="small"
                            variant="outlined"
                            endIcon={<OpenInNewOutlinedIcon fontSize="small" />}
                            onClick={handleNavigate}
                        >
                            OPEN {linkMeta.targetType === 'task' ? 'TASK' : 'DOCUMENT'}
                        </Button>
                    )}
                    {!readOnly && (
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<LinkOutlinedIcon fontSize="small" />}
                            onClick={() => setIsSelecting((prev) => !prev)}
                        >
                            {isSelecting ? 'CLOSE PICKER' : 'CHANGE TARGET'}
                        </Button>
                    )}
                </Box>
            </Box>

            {!readOnly && (isSelecting || !linkMeta.targetUuid) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                        size="small"
                        fullWidth
                        label="// SEARCH WORKSPACE DOCUMENTS ([[) OR TASKS (@)"
                        placeholder="Type document title or @task name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {filteredCandidates.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                                // NO_MATCHING_DOCUMENTS_OR_TASKS
                            </Typography>
                        ) : (
                            filteredCandidates.map((cand) => (
                                <Button
                                    key={`${cand.targetType}-${cand.targetUuid}`}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleSelectCandidate(cand)}
                                >
                                    [{cand.targetType === 'task' ? '@TASK' : '[[DOC'}] {cand.targetTitle}
                                </Button>
                            ))
                        )}
                    </Box>
                </Box>
            )}
        </Paper>
    );
}
