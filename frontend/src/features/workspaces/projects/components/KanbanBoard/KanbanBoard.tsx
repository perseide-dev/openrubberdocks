import React from 'react';
import { Box, Typography } from '@mui/material';
import { KanbanColumn } from '@features-workspaces/projects/components/KanbanBoard/KanbanColumn';
import type { KanbanBoardProps } from '@features-workspaces/projects/types/project.types';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    statuses,
    tasks,
    canManage,
    onTaskClick,
    onQuickAddTask,
    onMoveTask,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2.5,
                overflowX: 'auto',
                paddingBottom: 2,
                minHeight: '60vh',
            }}
        >
            {statuses.length === 0 ? (
                <Box sx={{ padding: 4 }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                        // NO_STATUS_COLUMNS_CONFIGURED
                    </Typography>
                </Box>
            ) : (
                statuses.map((status) => {
                    const columnTasks = tasks
                        .filter((t) => t.statusUuid === status.uuid)
                        .sort((a, b) => a.orderIndex - b.orderIndex);
                    return (
                        <KanbanColumn
                            key={status.uuid}
                            status={status}
                            tasks={columnTasks}
                            canManage={canManage}
                            onTaskClick={onTaskClick}
                            onQuickAddTask={onQuickAddTask}
                            onMoveTask={onMoveTask}
                        />
                    );
                })
            )}
        </Box>
    );
};
