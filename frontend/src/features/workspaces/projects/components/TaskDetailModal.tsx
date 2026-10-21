import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    Divider,
    IconButton,
    Chip,
    CircularProgress,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTaskModal } from '@features-workspaces/projects/hooks/useTaskModal';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { TimeLogModal } from '@features-workspaces/projects/components/TimelineView/TimeLogModal';
import type { TaskDetailModalProps } from '@features-workspaces/projects/types/project.types';

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    open,
    taskUuid,
    projectUuid,
    statuses,
    types,
    properties,
    canManage,
    onClose,
}) => {
    const {
        task,
        isLoading,
        title,
        setTitle,
        description,
        setDescription,
        statusUuid,
        setStatusUuid,
        typeUuid,
        setTypeUuid,
        startDate,
        setStartDate,
        dueDate,
        setDueDate,
        estimatedMinutes,
        setEstimatedMinutes,
        customProperties,
        handleCustomPropertyChange,
        subtaskTitle,
        setSubtaskTitle,
        handleAddSubtask,
        handleSaveTask,
        handleDeleteTask,
        isSaving,
        isDeleting,
    } = useTaskModal(projectUuid, taskUuid);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isTimeLogOpen, setIsTimeLogOpen] = useState(false);

    const onSave = async () => {
        await handleSaveTask();
        onClose();
    };

    const onDelete = async () => {
        await handleDeleteTask();
        setIsConfirmDeleteOpen(false);
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'monospace',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {taskUuid ? `// TASK #${task?.id || ''}` : '// NEW_TASK'}
                        </Typography>
                        {task?.status && (
                            <Chip
                                size="small"
                                label={task.status.name}
                                sx={{
                                    fontFamily: 'monospace',
                                    borderLeft: `4px solid ${task.status.color || '#000'}`,
                                }}
                            />
                        )}
                    </Box>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
                    {isLoading && taskUuid ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <>
                            {/* Main Title & Description */}
                            <TextField
                                label="Task Title"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!canManage}
                                required
                                placeholder="What needs to be done?"
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!canManage}
                                placeholder="Add technical details, acceptance criteria, or context..."
                            />

                            {/* Core Classifications */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    select
                                    label="Status Stage"
                                    value={statusUuid || (statuses[0]?.uuid ?? '')}
                                    onChange={(e) => setStatusUuid(e.target.value)}
                                    disabled={!canManage}
                                >
                                    {statuses.map((s) => (
                                        <MenuItem key={s.uuid} value={s.uuid}>
                                            {s.name} [{s.category}]
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    label="Task Type"
                                    value={typeUuid || (types[0]?.uuid ?? '')}
                                    onChange={(e) => setTypeUuid(e.target.value)}
                                    disabled={!canManage}
                                >
                                    {types.map((t) => (
                                        <MenuItem key={t.uuid} value={t.uuid}>
                                            {t.icon ? `${t.icon} ` : ''}{t.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Timeline & Estimates */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    type="date"
                                    label="Start Date"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={!canManage}
                                />
                                <TextField
                                    type="date"
                                    label="Due Date"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={!canManage}
                                />
                                <TextField
                                    type="number"
                                    label="Estimate (Minutes)"
                                    value={estimatedMinutes}
                                    onChange={(e) =>
                                        setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')
                                    }
                                    disabled={!canManage}
                                />
                            </Box>

                            {/* Notion Custom Properties */}
                            {properties.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Divider />
                                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                        // NOTION_DYNAMIC_PROPERTIES
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                        {properties.map((prop) => {
                                            const val = customProperties[prop.name] ?? '';
                                            if (prop.type === 'checkbox') {
                                                return (
                                                    <FormControlLabel
                                                        key={prop.uuid}
                                                        control={
                                                            <Checkbox
                                                                checked={Boolean(val)}
                                                                onChange={(e) =>
                                                                    handleCustomPropertyChange(prop.name, e.target.checked)
                                                                }
                                                                disabled={!canManage}
                                                            />
                                                        }
                                                        label={prop.name}
                                                    />
                                                );
                                            }
                                            if (prop.type === 'select' && prop.options) {
                                                return (
                                                    <TextField
                                                        key={prop.uuid}
                                                        select
                                                        label={prop.name}
                                                        value={val}
                                                        onChange={(e) =>
                                                            handleCustomPropertyChange(prop.name, e.target.value)
                                                        }
                                                        disabled={!canManage}
                                                    >
                                                        {prop.options.map((opt) => (
                                                            <MenuItem key={opt.id} value={opt.value ?? opt.label}>
                                                                {opt.label ?? opt.value}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                );
                                            }
                                            return (
                                                <TextField
                                                    key={prop.uuid}
                                                    type={prop.type === 'number' ? 'number' : prop.type === 'date' ? 'date' : 'text'}
                                                    label={prop.name}
                                                    slotProps={prop.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                                                    value={val}
                                                    onChange={(e) =>
                                                        handleCustomPropertyChange(prop.name, e.target.value)
                                                    }
                                                    disabled={!canManage}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            )}

                            {/* Subtasks Section (Only for existing tasks) */}
                            {taskUuid && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Divider />
                                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                        // SUBTASKS ({task?.subtasks?.length || 0})
                                    </Typography>
                                    {task?.subtasks && task.subtasks.length > 0 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {task.subtasks.map((st) => (
                                                <Box
                                                    key={st.uuid}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1,
                                                    }}
                                                >
                                                    <SubdirectoryArrowRightIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                                                        {st.title}
                                                    </Typography>
                                                    {st.status && (
                                                        <Chip
                                                            size="small"
                                                            label={st.status.name}
                                                            sx={{ fontFamily: 'monospace' }}
                                                        />
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {canManage && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="// ADD_SUBTASK..."
                                                value={subtaskTitle}
                                                onChange={(e) => setSubtaskTitle(e.target.value)}
                                                fullWidth
                                            />
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                onClick={handleAddSubtask}
                                                disabled={!subtaskTitle.trim() || isSaving}
                                            >
                                                ADD
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {taskUuid && canManage && (
                            <Button
                                color="error"
                                startIcon={<DeleteOutlinedIcon />}
                                onClick={() => setIsConfirmDeleteOpen(true)}
                                disabled={isDeleting}
                            >
                                DELETE
                            </Button>
                        )}
                        {taskUuid && (
                            <Button
                                color="secondary"
                                startIcon={<AccessTimeIcon />}
                                onClick={() => setIsTimeLogOpen(true)}
                            >
                                LOG TIME
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={onClose}>CANCEL</Button>
                        {canManage && (
                            <Button
                                variant="contained"
                                onClick={onSave}
                                disabled={isSaving || !title.trim()}
                            >
                                {taskUuid ? 'SAVE CHANGES' : 'CREATE TASK'}
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Confirm task deletion */}
            <ConfirmModal
                open={isConfirmDeleteOpen}
                title={`DELETE TASK: #${task?.id || ''}`}
                description={`Are you sure you want to delete task "${task?.title}"? All subtasks and logged hours will be removed.`}
                isLoading={isDeleting}
                onConfirm={onDelete}
                onClose={() => setIsConfirmDeleteOpen(false)}
            />

            {/* Time Log modal */}
            {task && (
                <TimeLogModal
                    open={isTimeLogOpen}
                    task={task}
                    onClose={() => setIsTimeLogOpen(false)}
                />
            )}
        </>
    );
};
