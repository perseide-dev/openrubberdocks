import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TaskCard } from '@features-workspaces/projects/components/KanbanBoard/TaskCard';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import type { KanbanColumnProps } from '@features-workspaces/projects/types/project.types';

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    tasks,
    canManage,
    onTaskClick,
    onAddTask,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [quickTitle, setQuickTitle] = useState('');

    const handleQuickSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTitle.trim()) return;
        onAddTask(status.uuid);
        setIsAdding(false);
        setQuickTitle('');
    };

    return (
        <Box
            sx={{
                width: 300,
                minWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                padding: 1.5,
            }}
        >
            {/* Column Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {status.name}
                    </Typography>
                    <Chip
                        label={tasks.length}
                        size="small"
                        sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            height: 20,
                        }}
                    />
                </Box>

                {canManage && (
                    <Button
                        size="small"
                        onClick={() => setIsAdding(true)}
                    >
                        <AddIcon fontSize="small" />
                    </Button>
                )}
            </Box>

            {/* Quick Add Input */}
            {isAdding && (
                <Box component="form" onSubmit={handleQuickSubmit}>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        placeholder="Task title..."
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onBlur={() => {
                            if (!quickTitle.trim()) setIsAdding(false);
                        }}
                    />
                </Box>
            )}

            {/* Tasks Container */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 280px)',
                }}
            >
                {tasks.length === 0 ? (
                    <Box sx={{ padding: 2, textAlign: 'center' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                            }}
                        >
                            {PROJECT_LABELS.NO_TASKS}
                        </Typography>
                    </Box>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.uuid}
                            task={task}
                            onTaskClick={onTaskClick}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
};
