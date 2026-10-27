import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    LinearProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { TimelineViewProps } from '@features-workspaces/projects/types/project.types';

export const TimelineView: React.FC<TimelineViewProps> = ({
    tasks,
    canManage,
    onTaskClick,
    onOpenTimeLog,
}) => {
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
                    // CRONOGRAMA & HORAS REGISTRADAS
                </Typography>
            </Box>

            {tasks.length === 0 ? (
                <Box sx={{ padding: 4, textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                        // NO_TASKS_SCHEDULED
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {tasks.map((task) => {
                        const totalSpentMinutes =
                            task.timeLogs?.reduce((acc, curr) => acc + curr.minutes, 0) || 0;
                        const estimatedMinutes = task.estimatedMinutes || 0;
                        const progress =
                            estimatedMinutes > 0
                                ? Math.min(100, Math.round((totalSpentMinutes / estimatedMinutes) * 100))
                                : 0;

                        return (
                            <Card key={task.uuid} variant="outlined">
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        padding: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {task.type && (
                                                <Chip
                                                    label={task.type.name}
                                                    size="small"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        borderLeft: task.type.color ? `3px solid ${task.type.color}` : undefined,
                                                    }}
                                                />
                                            )}
                                            {task.status && (
                                                <Chip
                                                    label={task.status.name}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.7rem',
                                                        height: 20,
                                                        borderLeft: `4px solid ${task.status.color || '#71717A'}`,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {task.title}
                                        </Typography>
                                    </Box>

                                    {/* Dates & Time Tracking Bar */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                            minWidth: { sm: 260 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {task.startDate
                                                    ? new Date(task.startDate).toLocaleDateString()
                                                    : 'No start'}
                                                {' -> '}
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString()
                                                    : 'No due'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {`${Math.floor(totalSpentMinutes / 60)}h ${totalSpentMinutes % 60}m`}
                                                {estimatedMinutes > 0
                                                    ? ` / ${Math.floor(estimatedMinutes / 60)}h`
                                                    : ''}
                                            </Typography>
                                        </Box>

                                        {estimatedMinutes > 0 && (
                                            <LinearProgress
                                                variant="determinate"
                                                value={progress}
                                                sx={{ height: 6 }}
                                            />
                                        )}
                                    </Box>

                                    {/* Action button */}
                                    {canManage && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<AccessTimeIcon />}
                                            onClick={() => onOpenTimeLog(task)}
                                        >
                                            Time Logs
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};
