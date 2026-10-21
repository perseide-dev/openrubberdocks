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
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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

                <DialogContent dividers sx={{ p: 0 }}>
                    {isLoading && taskUuid ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr auto 340px' },
                                minHeight: 480,
                            }}
                        >
                            {/* Left Column: Title, Description, Subtasks */}
                            <Box
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
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
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={!canManage}
                                    placeholder="Add technical details, acceptance criteria, or context..."
                                />

                                {/* Subtasks Section */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                        // SUBTASKS {taskUuid ? `(${task?.subtasks?.length || 0})` : ''}
                                    </Typography>

                                    {taskUuid ? (
                                        <>
                                            {task?.subtasks && task.subtasks.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {task.subtasks.map((st) => (
                                                        <Box
                                                            key={st.uuid}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 1.5,
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
                                            ) : (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                    NO_SUBTASKS_FOUND
                                                </Typography>
                                            )}

                                            {canManage && (
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        placeholder="// ADD_SUBTASK..."
                                                        value={subtaskTitle}
                                                        onChange={(e) => setSubtaskTitle(e.target.value)}
                                                        fullWidth
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (subtaskTitle.trim() && !isSaving) {
                                                                    handleAddSubtask();
                                                                }
                                                            }
                                                        }}
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
                                        </>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                            // CREATE_TASK_FIRST_TO_ATTACH_SUBTASKS
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Column Separator */}
                            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                            {/* Right Column: Properties sidebar */}
                            <Box
                                sx={{
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2.5,
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                    // PROPERTIES
                                </Typography>

                                <TextField
                                    select
                                    label="Status Stage"
                                    size="small"
                                    fullWidth
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
                                    size="small"
                                    fullWidth
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

                                <TextField
                                    type="date"
                                    label="Start Date"
                                    size="small"
                                    fullWidth
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={!canManage}
                                />

                                <TextField
                                    type="date"
                                    label="Due Date"
                                    size="small"
                                    fullWidth
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={!canManage}
                                />

                                <TextField
                                    type="number"
                                    label="Estimate (Minutes)"
                                    size="small"
                                    fullWidth
                                    value={estimatedMinutes}
                                    onChange={(e) =>
                                        setEstimatedMinutes(e.target.value ? Number(e.target.value) : '')
                                    }
                                    disabled={!canManage}
                                />

                                {properties.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                            // CUSTOM_PROPERTIES
                                        </Typography>

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
                                            if (prop.type === 'select') {
                                                return (
                                                    <TextField
                                                        key={prop.uuid}
                                                        select
                                                        size="small"
                                                        fullWidth
                                                        label={prop.name}
                                                        value={val}
                                                        onChange={(e) =>
                                                            handleCustomPropertyChange(prop.name, e.target.value)
                                                        }
                                                        disabled={!canManage}
                                                    >
                                                        {prop.options && prop.options.length > 0 ? (
                                                            prop.options.map((opt) => (
                                                                <MenuItem key={opt.id} value={opt.value ?? opt.label}>
                                                                    {opt.label ?? opt.value}
                                                                </MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem disabled value="">
                                                                (No options configured)
                                                            </MenuItem>
                                                        )}
                                                    </TextField>
                                                );
                                            }
                                            if (prop.type === 'multi_select') {
                                                const rawVal = customProperties[prop.name];
                                                const multiVal = Array.isArray(rawVal)
                                                    ? (rawVal as string[])
                                                    : typeof rawVal === 'string' && rawVal
                                                    ? [rawVal]
                                                    : [];
                                                return (
                                                    <TextField
                                                        key={prop.uuid}
                                                        select
                                                        size="small"
                                                        fullWidth
                                                        label={prop.name}
                                                        value={multiVal}
                                                        onChange={(e) => {
                                                            const selected =
                                                                typeof e.target.value === 'string'
                                                                    ? e.target.value.split(',')
                                                                    : e.target.value;
                                                            handleCustomPropertyChange(prop.name, selected);
                                                        }}
                                                        disabled={!canManage}
                                                        slotProps={{
                                                            select: {
                                                                multiple: true,
                                                                renderValue: (selected: unknown) => (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {(selected as string[]).map((v) => (
                                                                            <Chip
                                                                                key={v}
                                                                                label={v}
                                                                                size="small"
                                                                                sx={{ fontFamily: 'monospace' }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                ),
                                                            },
                                                        }}
                                                    >
                                                        {prop.options && prop.options.length > 0 ? (
                                                            prop.options.map((opt) => {
                                                                const optVal = opt.value ?? opt.label;
                                                                return (
                                                                    <MenuItem key={opt.id} value={optVal}>
                                                                        <Checkbox
                                                                            checked={multiVal.includes(optVal)}
                                                                            size="small"
                                                                        />
                                                                        <Typography variant="body2">{opt.label ?? opt.value}</Typography>
                                                                    </MenuItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <MenuItem disabled value="">
                                                                (No options configured)
                                                            </MenuItem>
                                                        )}
                                                    </TextField>
                                                );
                                            }
                                            return (
                                                <TextField
                                                    key={prop.uuid}
                                                    size="small"
                                                    fullWidth
                                                    type={
                                                        prop.type === 'number'
                                                            ? 'number'
                                                            : prop.type === 'date'
                                                            ? 'date'
                                                            : 'text'
                                                    }
                                                    label={prop.name}
                                                    slotProps={
                                                        prop.type === 'date'
                                                            ? { inputLabel: { shrink: true } }
                                                            : undefined
                                                    }
                                                    value={val}
                                                    onChange={(e) =>
                                                        handleCustomPropertyChange(prop.name, e.target.value)
                                                    }
                                                    disabled={!canManage}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </Box>
                        </Box>
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
