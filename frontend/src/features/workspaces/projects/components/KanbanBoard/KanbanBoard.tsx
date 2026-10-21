import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
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
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !canManage) return;

        const activeTaskUuid = String(active.id);
        const overId = String(over.id);

        if (activeTaskUuid === overId) return;

        let targetStatusUuid: string | undefined;
        let targetOrderIndex = 0;

        // Check if dropped directly on a status column
        const isOverColumn = statuses.some((s) => s.uuid === overId);
        if (isOverColumn) {
            targetStatusUuid = overId;
            const columnTasks = tasks.filter((t) => t.statusUuid === targetStatusUuid);
            targetOrderIndex = columnTasks.length;
        } else {
            // Dropped on another task
            const overTask = tasks.find((t) => t.uuid === overId);
            if (overTask) {
                targetStatusUuid = overTask.statusUuid;
                const columnTasks = tasks
                    .filter((t) => t.statusUuid === targetStatusUuid)
                    .sort((a, b) => a.orderIndex - b.orderIndex);
                const overIndex = columnTasks.findIndex((t) => t.uuid === overId);
                targetOrderIndex = overIndex >= 0 ? overIndex : columnTasks.length;
            }
        }

        if (targetStatusUuid) {
            onMoveTask(activeTaskUuid, targetStatusUuid, targetOrderIndex);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
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
        </DndContext>
    );
};
