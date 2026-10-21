import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
    useTaskTimeLogsService,
    useCreateTaskTimeLogService,
    useDeleteTaskTimeLogService,
} from '@features-workspaces/projects/services/project.service';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import type { TimeLogModalProps } from '@features-workspaces/projects/types/project.types';

export const TimeLogModal: React.FC<TimeLogModalProps> = ({
    open,
    task,
    onClose,
}) => {
    const taskUuid = task?.uuid || null;
    const projectUuid = task?.projectUuid || '';
    const { data: logs = [] } = useTaskTimeLogsService(taskUuid);
    const createLogMutation = useCreateTaskTimeLogService();
    const deleteLogMutation = useDeleteTaskTimeLogService();

    const [minutes, setMinutes] = useState<number | ''>(60);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskUuid || !minutes || typeof minutes !== 'number') return;

        await createLogMutation.mutateAsync({
            taskUuid,
            projectUuid,
            payload: {
                minutes,
                description: description.trim() || undefined,
                date: date || undefined,
            },
        });

        setDescription('');
        setMinutes(60);
    };

    const handleDeleteLog = async (logUuid: string) => {
        if (!taskUuid) return;
        await deleteLogMutation.mutateAsync({
            taskUuid,
            projectUuid,
            logUuid,
        });
    };

    const totalMinutes = logs.reduce((acc, curr) => acc + curr.minutes, 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                {`// TIME_LOGS: ${task?.title || ''}`}
            </DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    paddingTop: '16px !important',
                }}
            >
                {/* Total Logged Summary */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 1.5,
                    }}
                >
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        // TOTAL_SPENT:
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    >
                        {`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                    </Typography>
                </Box>

                {/* Form to log time */}
                <Box
                    component="form"
                    onSubmit={handleLogSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            required
                            type="number"
                            label="Minutes"
                            value={minutes}
                            onChange={(e) =>
                                setMinutes(e.target.value ? Number(e.target.value) : '')
                            }
                        />
                        <TextField
                            type="date"
                            label="Date"
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        label="Work Notes"
                        placeholder="What did you work on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createLogMutation.isPending || !minutes}
                        >
                            {PROJECT_LABELS.LOG_TIME}
                        </Button>
                    </Box>
                </Box>

                <Divider />

                {/* Logs List */}
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    // LOGGED_ENTRIES ({logs.length})
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        maxHeight: 220,
                        overflowY: 'auto',
                    }}
                >
                    {logs.length === 0 ? (
                        <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                            // NO_TIME_LOGGED_YET
                        </Typography>
                    ) : (
                        logs.map((log) => (
                            <Box
                                key={log.uuid}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 1,
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                                    >
                                        {`${log.minutes} min`} - {new Date(log.date).toLocaleDateString()}
                                    </Typography>
                                    {log.description && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {log.description}
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteLog(log.uuid)}
                                >
                                    <DeleteOutlinedIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2.5 }}>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
