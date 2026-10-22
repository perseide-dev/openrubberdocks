import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { TasksTableProps } from '@features-workspaces/projects/types/project.types';

export const TasksTable: React.FC<TasksTableProps> = ({
    tasks,
    properties,
    canManage,
    onTaskClick,
    onDeleteTask,
}) => {
    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // TITLE
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // STATUS
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // TYPE
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // ASSIGNEES
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // DUE_DATE
                        </TableCell>
                        {properties.map((prop) => (
                            <TableCell
                                key={prop.uuid}
                                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                            >
                                {`// ${prop.name.toUpperCase()}`}
                            </TableCell>
                        ))}
                        {canManage && <TableCell align="right">// ACTIONS</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6 + properties.length}
                                align="center"
                                sx={{ padding: 4 }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        color: 'text.secondary',
                                    }}
                                >
                                    // NO_TASKS_FOUND
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow
                                key={task.uuid}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => onTaskClick(task)}
                            >
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {task.title}
                                        </Typography>
                                        {task.parentTaskUuid && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                // SUBTASK
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {task.status && (
                                        <Chip
                                            label={task.status.name}
                                            size="small"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                borderLeft: `4px solid ${task.status.color || '#71717A'}`,
                                            }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.type && (
                                        <Chip
                                            label={task.type.name}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                borderLeft: task.type.color ? `4px solid ${task.type.color}` : undefined,
                                            }}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.assignees && task.assignees.length > 0 ? (
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {task.assignees.map((a) => (
                                                <Chip
                                                    key={a.uuid}
                                                    label={`@${a.username}`}
                                                    size="small"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.65rem',
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            --
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString()
                                        : '--'}
                                </TableCell>
                                {properties.map((prop) => {
                                    const val = task.customProperties?.[prop.name];
                                    return (
                                        <TableCell
                                            key={prop.uuid}
                                            sx={{ fontFamily: 'monospace' }}
                                        >
                                            {val !== undefined && val !== null ? String(val) : '--'}
                                        </TableCell>
                                    );
                                })}
                                {canManage && (
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTask?.(task.uuid);
                                            }}
                                        >
                                            <DeleteOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
