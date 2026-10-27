import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import {
    isDateInCurrentWeek,
    isDateInCurrentMonth,
    formatDisplayDate,
} from '@utils-functions/date.utils';
import type {
    ExternalProjectOverviewProps,
    UpcomingRangeFilter,
} from '@features-workspaces/projects/types/project.types';

export const ExternalProjectOverview: React.FC<ExternalProjectOverviewProps> = ({
    tasks,
    onTaskClick,
}) => {
    const [upcomingFilter, setUpcomingFilter] = useState<UpcomingRangeFilter>('week');

    // Metrics calculations
    const totalTasks = tasks.length;
    const completedTasks = useMemo(
        () => tasks.filter((t) => t.status?.category === 'DONE'),
        [tasks]
    );
    const inProgressTasks = useMemo(
        () => tasks.filter((t) => t.status?.category === 'IN_PROGRESS'),
        [tasks]
    );
    const pendingTasks = useMemo(
        () => tasks.filter((t) => t.status?.category === 'TODO'),
        [tasks]
    );

    const completionPercentage = totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    // Latest completed tasks (sorted by updatedAt descending)
    const latestCompleted = useMemo(() => {
        return [...completedTasks]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10);
    }, [completedTasks]);

    // Upcoming tasks with due date in current week or month (not completed / cancelled)
    const upcomingTasks = useMemo(() => {
        return tasks
            .filter((t) => {
                if (!t.dueDate) return false;
                if (t.status?.category === 'DONE' || t.status?.category === 'CANCELLED') return false;
                return upcomingFilter === 'week'
                    ? isDateInCurrentWeek(t.dueDate)
                    : isDateInCurrentMonth(t.dueDate);
            })
            .sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                return dateA - dateB;
            });
    }, [tasks, upcomingFilter]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Project Metrics Summary */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                }}
            >
                <Paper variant="outlined" sx={{ padding: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 1 }}>
                        <AssignmentIcon fontSize="small" color="action" />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {PROJECT_LABELS.TOTAL_TASKS}
                        </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {totalTasks}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ padding: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 1 }}>
                        <CheckCircleOutlinedIcon fontSize="small" color="success" />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {PROJECT_LABELS.COMPLETED_TASKS}
                        </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {completedTasks.length}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ padding: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 1 }}>
                        <ScheduleIcon fontSize="small" color="primary" />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {PROJECT_LABELS.IN_PROGRESS_TASKS}
                        </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {inProgressTasks.length}
                    </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ padding: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 1 }}>
                        <HourglassEmptyIcon fontSize="small" color="warning" />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {PROJECT_LABELS.PENDING_TASKS}
                        </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {pendingTasks.length}
                    </Typography>
                </Paper>
            </Box>

            {/* Completion Progress Bar */}
            <Paper variant="outlined" sx={{ padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {PROJECT_LABELS.PROGRESS}
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {completionPercentage}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{ height: 14 }}
                />
            </Paper>

            {/* Upcoming Deadlines (Week / Month filter) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {PROJECT_LABELS.UPCOMING_DEADLINES}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant={upcomingFilter === 'week' ? 'contained' : 'outlined'}
                            onClick={() => setUpcomingFilter('week')}
                            sx={{ fontFamily: 'monospace' }}
                        >
                            {PROJECT_LABELS.THIS_WEEK}
                        </Button>
                        <Button
                            size="small"
                            variant={upcomingFilter === 'month' ? 'contained' : 'outlined'}
                            onClick={() => setUpcomingFilter('month')}
                            sx={{ fontFamily: 'monospace' }}
                        >
                            {PROJECT_LABELS.THIS_MONTH}
                        </Button>
                    </Box>
                </Box>

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
                                    // DUE_DATE
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                    // ASSIGNEES
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {upcomingTasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ padding: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {PROJECT_LABELS.NO_UPCOMING_TASKS}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                upcomingTasks.map((task) => (
                                    <TableRow
                                        key={task.uuid}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {task.title}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={task.status?.name ?? '// NO_STATUS'}
                                                sx={{ fontFamily: 'monospace' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {formatDisplayDate(task.dueDate)}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {task.assignees && task.assignees.length > 0
                                                ? task.assignees.map((a) => a.username).join(', ')
                                                : '// UNASSIGNED'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Latest Completed Tasks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {PROJECT_LABELS.LATEST_COMPLETED}
                </Typography>

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
                                    // COMPLETED_AT
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                    // ASSIGNEES
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {latestCompleted.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ padding: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {PROJECT_LABELS.NO_COMPLETED_TASKS}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                latestCompleted.map((task) => (
                                    <TableRow
                                        key={task.uuid}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {task.title}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                color="success"
                                                label={task.status?.name ?? '// DONE'}
                                                sx={{ fontFamily: 'monospace' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {formatDisplayDate(task.updatedAt)}
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                            {task.assignees && task.assignees.length > 0
                                                ? task.assignees.map((a) => a.username).join(', ')
                                                : '// UNASSIGNED'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};
