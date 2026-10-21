import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import LabelIcon from '@mui/icons-material/Label';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import TuneIcon from '@mui/icons-material/Tune';
import { useProjectSettings } from '@features-workspaces/projects/hooks/useProjectSettings';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import {
    PROPERTY_TYPE_OPTIONS,
} from '@features-workspaces/projects/constants/project.constants';
import type {
    ProjectSettingsTabProps,
    TaskStatusCategory,
    TaskPropertyType,
} from '@features-workspaces/projects/types/project.types';

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({
    projectUuid,
    statuses,
    types,
    properties,
    canManage,
}) => {
    const {
        handleCreateStatus,
        handleDeleteStatus,
        handleCreateType,
        handleDeleteType,
        handleCreateProperty,
        handleDeleteProperty,
        isSubmitting,
    } = useProjectSettings(projectUuid);

    // New status form state
    const [statusName, setStatusName] = useState('');
    const [statusCategory, setStatusCategory] = useState<TaskStatusCategory>('TODO');
    const [statusColor, setStatusColor] = useState('#2563EB');

    // New type form state
    const [typeName, setTypeName] = useState('');
    const [typeIcon, setTypeIcon] = useState('📌');
    const [typeColor, setTypeColor] = useState('#10B981');

    // New property form state
    const [propertyName, setPropertyName] = useState('');
    const [propertyType, setPropertyType] = useState<TaskPropertyType>('text');
    const [optionTags, setOptionTags] = useState<string[]>([]);
    const [currentOptionInput, setCurrentOptionInput] = useState('');

    // Confirm modal states
    const [itemToDelete, setItemToDelete] = useState<{
        type: 'status' | 'type' | 'property';
        uuid: string;
        name: string;
    } | null>(null);

    const handleAddOption = () => {
        const trimmed = currentOptionInput.trim();
        if (!trimmed) return;
        if (!optionTags.includes(trimmed)) {
            setOptionTags((prev) => [...prev, trimmed]);
        }
        setCurrentOptionInput('');
    };

    const handleRemoveOption = (indexToRemove: number) => {
        setOptionTags((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const onAddStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusName.trim()) return;
        await handleCreateStatus({
            name: statusName.trim(),
            category: statusCategory,
            color: statusColor,
            orderIndex: statuses.length,
        });
        setStatusName('');
    };

    const onAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!typeName.trim()) return;
        await handleCreateType({
            name: typeName.trim(),
            icon: typeIcon.trim() || undefined,
            color: typeColor,
        });
        setTypeName('');
    };

    const onAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyName.trim()) return;
        const isSelect = propertyType === 'select' || propertyType === 'multi_select';
        if (isSelect && optionTags.length === 0) {
            return;
        }

        const options = isSelect
            ? optionTags.map((opt, idx) => ({
                  id: `opt_${Date.now()}_${idx}`,
                  label: opt,
                  value: opt,
              }))
            : undefined;

        await handleCreateProperty({
            name: propertyName.trim(),
            type: propertyType,
            options,
            orderIndex: properties.length,
        });
        setPropertyName('');
        setOptionTags([]);
        setCurrentOptionInput('');
    };

    const onConfirmDelete = async () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'status') {
            await handleDeleteStatus(itemToDelete.uuid);
        } else if (itemToDelete.type === 'type') {
            await handleDeleteType(itemToDelete.uuid);
        } else if (itemToDelete.type === 'property') {
            await handleDeleteProperty(itemToDelete.uuid);
        }
        setItemToDelete(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon />
                <Typography variant="h6" sx={{ fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    // PROJECT_CONFIGURATION & NOTION_ATTRIBUTES
                </Typography>
            </Box>

            {/* Section 1: Workflow Stages / Statuses */}
            <Card variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewColumnIcon fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // WORKFLOW_STATUSES ({statuses.length})
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Customize workflow columns and state machine categories for tasks in this project.
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {statuses.map((s) => (
                            <Chip
                                key={s.uuid}
                                label={`${s.name} [${s.category}]`}
                                onDelete={canManage ? () => setItemToDelete({ type: 'status', uuid: s.uuid, name: s.name }) : undefined}
                                deleteIcon={canManage ? <DeleteOutlinedIcon /> : undefined}
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 600,
                                    borderLeft: `4px solid ${s.color || '#000'}`,
                                }}
                            />
                        ))}
                    </Box>

                    {canManage && (
                        <Box
                            component="form"
                            onSubmit={onAddStatus}
                            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}
                        >
                            <TextField
                                size="small"
                                label="Status Name"
                                value={statusName}
                                onChange={(e) => setStatusName(e.target.value)}
                                placeholder="e.g. IN QA"
                                required
                                sx={{ minWidth: 160 }}
                            />
                            <TextField
                                size="small"
                                select
                                label="Category"
                                value={statusCategory}
                                onChange={(e) => setStatusCategory(e.target.value as TaskStatusCategory)}
                                sx={{ minWidth: 140 }}
                            >
                                <MenuItem value="TODO">To Do</MenuItem>
                                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                <MenuItem value="DONE">Done</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </TextField>
                            <TextField
                                size="small"
                                label="Color Hex"
                                value={statusColor}
                                onChange={(e) => setStatusColor(e.target.value)}
                                sx={{ width: 120 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={isSubmitting || !statusName.trim()}
                            >
                                ADD STATUS
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Section 2: Task Types & Icons */}
            <Card variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LabelIcon fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // TASK_TYPES & ICONS ({types.length})
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Configure customized icons and types for classifying deliverables (e.g. Feature, Bug, Spike).
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {types.map((t) => (
                            <Chip
                                key={t.uuid}
                                label={`${t.icon || '📌'} ${t.name}`}
                                onDelete={canManage ? () => setItemToDelete({ type: 'type', uuid: t.uuid, name: t.name }) : undefined}
                                deleteIcon={canManage ? <DeleteOutlinedIcon /> : undefined}
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 600,
                                }}
                            />
                        ))}
                    </Box>

                    {canManage && (
                        <Box
                            component="form"
                            onSubmit={onAddType}
                            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}
                        >
                            <TextField
                                size="small"
                                label="Type Name"
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                placeholder="e.g. Security Audit"
                                required
                                sx={{ minWidth: 160 }}
                            />
                            <TextField
                                size="small"
                                label="Icon (Emoji)"
                                value={typeIcon}
                                onChange={(e) => setTypeIcon(e.target.value)}
                                sx={{ width: 100 }}
                            />
                            <TextField
                                size="small"
                                label="Color Hex"
                                value={typeColor}
                                onChange={(e) => setTypeColor(e.target.value)}
                                sx={{ width: 120 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={isSubmitting || !typeName.trim()}
                            >
                                ADD TYPE
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Section 3: Notion-Style Custom Properties */}
            <Card variant="outlined">
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TuneIcon fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            // NOTION_CUSTOM_PROPERTIES ({properties.length})
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Define dynamic fields that every task in this project can store (Text, Numbers, Selects, Dates, Users).
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {properties.map((p) => {
                            const optionsLabel =
                                p.options && p.options.length > 0
                                    ? `: [${p.options.map((o) => o.label || o.value).join(', ')}]`
                                    : '';
                            return (
                                <Chip
                                    key={p.uuid}
                                    label={`${p.name} (${p.type}${optionsLabel})`}
                                    onDelete={
                                        canManage
                                            ? () =>
                                                  setItemToDelete({
                                                      type: 'property',
                                                      uuid: p.uuid,
                                                      name: p.name,
                                                  })
                                            : undefined
                                    }
                                    deleteIcon={canManage ? <DeleteOutlinedIcon /> : undefined}
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 600,
                                    }}
                                />
                            );
                        })}
                    </Box>

                    {canManage && (
                        <Box
                            component="form"
                            onSubmit={onAddProperty}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
                        >
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    label="Property Name"
                                    value={propertyName}
                                    onChange={(e) => setPropertyName(e.target.value)}
                                    placeholder="e.g. Impact Score"
                                    required
                                    sx={{ minWidth: 160 }}
                                />
                                <TextField
                                    size="small"
                                    select
                                    label="Field Type"
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value as TaskPropertyType)}
                                    sx={{ minWidth: 140 }}
                                >
                                    {PROPERTY_TYPE_OPTIONS.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    disabled={
                                        isSubmitting ||
                                        !propertyName.trim() ||
                                        ((propertyType === 'select' || propertyType === 'multi_select') &&
                                            optionTags.length === 0)
                                    }
                                >
                                    ADD PROPERTY
                                </Button>
                            </Box>

                            {/* Option Builder for Select & Multi-Select */}
                            {(propertyType === 'select' || propertyType === 'multi_select') && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                        p: 2,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                                        // DEFINE_OPTIONS (Required for {propertyType.toUpperCase()}):
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <TextField
                                            size="small"
                                            label="Option Label"
                                            placeholder="e.g. High Priority"
                                            value={currentOptionInput}
                                            onChange={(e) => setCurrentOptionInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddOption();
                                                }
                                            }}
                                            sx={{ minWidth: 200 }}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleAddOption}
                                            disabled={!currentOptionInput.trim()}
                                        >
                                            + ADD OPTION
                                        </Button>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {optionTags.map((tag, idx) => (
                                            <Chip
                                                key={idx}
                                                size="small"
                                                label={tag}
                                                onDelete={() => handleRemoveOption(idx)}
                                                deleteIcon={<DeleteOutlinedIcon />}
                                                sx={{ fontFamily: 'monospace' }}
                                            />
                                        ))}
                                        {optionTags.length === 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Add at least one option before saving this property.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation modal */}
            <ConfirmModal
                open={Boolean(itemToDelete)}
                title={`DELETE ${itemToDelete?.type?.toUpperCase() || ''}: ${itemToDelete?.name || ''}`}
                description={`Are you sure you want to delete this configuration item? Tasks using this ${itemToDelete?.type} may lose this association.`}
                isLoading={isSubmitting}
                onConfirm={onConfirmDelete}
                onClose={() => setItemToDelete(null)}
            />
        </Box>
    );
};
