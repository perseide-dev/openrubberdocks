import React from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    Tooltip,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import { REVISION_LABELS } from '@features-workspaces/files/constants/revision.constants';
import type { RevisionItemCardProps } from '@features-workspaces/files/types/revision.types';

export const RevisionItemCard: React.FC<RevisionItemCardProps> = ({
    revision,
    canRestore = false,
    isRestoring = false,
    onRestoreClick,
}) => {
    const formattedDate = new Date(revision.createdAt).toLocaleDateString();
    const formattedTime = new Date(revision.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const authorHandle = revision.createdBy?.username
        ? `@${revision.createdBy.username}`
        : REVISION_LABELS.SYSTEM_AUTHOR;
    const blocksCount = revision.blocksSnapshot?.length || 0;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                padding: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryToggleOffIcon fontSize="small" />
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    >
                        {formattedDate} {formattedTime}
                    </Typography>
                </Box>
                <Chip
                    label={authorHandle}
                    size="small"
                    sx={{ fontFamily: 'monospace' }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {revision.title || 'Untitled'}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                >
                    {`// ${REVISION_LABELS.BLOCK_COUNT(blocksCount)}`}
                </Typography>
            </Box>

            {revision.blocksSnapshot && revision.blocksSnapshot.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        padding: 1,
                    }}
                >
                    {revision.blocksSnapshot.slice(0, 3).map((b, idx) => {
                        const content = (b.properties?.text as string) || b.type;
                        return (
                            <Typography
                                key={b.uuid || idx}
                                variant="caption"
                                noWrap
                                sx={{
                                    fontFamily: 'monospace',
                                    color: 'text.secondary',
                                }}
                            >
                                {`> [${b.type}] ${content}`}
                            </Typography>
                        );
                    })}
                    {revision.blocksSnapshot.length > 3 && (
                        <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                            {`... +${revision.blocksSnapshot.length - 3} more`}
                        </Typography>
                    )}
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}>
                {canRestore ? (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        disabled={isRestoring}
                        onClick={() => onRestoreClick?.(revision)}
                    >
                        {REVISION_LABELS.RESTORE_BUTTON}
                    </Button>
                ) : (
                    <Tooltip title={REVISION_LABELS.TOOLTIP_MUTATION_LOCKED}>
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                disabled
                                startIcon={<RestoreIcon />}
                            >
                                {REVISION_LABELS.RESTORE_BUTTON}
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};
