import React from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { TaskCardProps } from '@features-workspaces/projects/types/project.types';

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
    const subtaskCount = task.subtasks?.length || 0;
    const formattedDue = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;

    return (
        <Card variant="outlined">
            <CardActionArea onClick={() => onTaskClick(task)}>
                <CardContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        padding: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {task.type && (
                            <Chip
                                label={task.type.name}
                                size="small"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.7rem',
                                    height: 20,
                                }}
                            />
                        )}
                        {formattedDue && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ScheduleIcon sx={{ fontSize: '0.8rem' }} />
                                <Typography
                                    variant="caption"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                >
                                    {formattedDue}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {task.title}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {subtaskCount > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SubdirectoryArrowRightIcon sx={{ fontSize: '0.9rem' }} />
                                <Typography
                                    variant="caption"
                                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                >
                                    {subtaskCount}
                                </Typography>
                            </Box>
                        ) : (
                            <Box />
                        )}

                        {task.assignees && task.assignees.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {task.assignees.slice(0, 2).map((a) => (
                                    <Chip
                                        key={a.uuid}
                                        label={`@${a.username}`}
                                        size="small"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.65rem',
                                            height: 18,
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
