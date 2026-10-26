import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  STATUS_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from '@features/admin/audit-logs/constants/audit.constants';
import type { AuditLogFiltersProps } from '@features/admin/audit-logs/types/audit.types';

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  workspaces = [],
  onFilterChange,
  onResetFilters,
  hideWorkspaceFilter = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        paddingY: 2,
      }}
    >
      <TextField
        size="small"
        label="// ACTION"
        value={filters.action || ''}
        onChange={(e) => onFilterChange('action', e.target.value || undefined)}
        placeholder="e.g. WORKSPACE_POST, LOGIN"
        sx={{ minWidth: 200, flex: 1 }}
      />

      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id="audit-resource-label">// RESOURCE</InputLabel>
        <Select
          labelId="audit-resource-label"
          value={filters.resourceType || ''}
          label="// RESOURCE"
          onChange={(e) =>
            onFilterChange('resourceType', e.target.value ? (e.target.value as string) : undefined)
          }
        >
          {RESOURCE_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="audit-status-label">// STATUS</InputLabel>
        <Select
          labelId="audit-status-label"
          value={filters.status || ''}
          label="// STATUS"
          onChange={(e) =>
            onFilterChange(
              'status',
              e.target.value ? (e.target.value as 'SUCCESS' | 'FAILURE') : undefined,
            )
          }
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!hideWorkspaceFilter && (
        <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
          <InputLabel id="audit-workspace-label">// WORKSPACE</InputLabel>
          <Select
            labelId="audit-workspace-label"
            value={filters.workspaceUuid || ''}
            label="// WORKSPACE"
            onChange={(e) =>
              onFilterChange(
                'workspaceUuid',
                e.target.value ? (e.target.value as string) : undefined,
              )
            }
          >
            <MenuItem value="">
              <em>// ALL_WORKSPACES</em>
            </MenuItem>
            {workspaces.map((ws) => (
              <MenuItem key={ws.uuid} value={ws.uuid}>
                {ws.name.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        size="small"
        label="// FROM_DATE"
        type="date"
        value={filters.from || ''}
        onChange={(e) => onFilterChange('from', e.target.value || undefined)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 170 }}
      />

      <TextField
        size="small"
        label="// TO_DATE"
        type="date"
        value={filters.to || ''}
        onChange={(e) => onFilterChange('to', e.target.value || undefined)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 170 }}
      />

      <Button
        variant="outlined"
        color="inherit"
        startIcon={<RestartAltIcon />}
        onClick={onResetFilters}
        sx={{ minHeight: 40 }}
      >
        // RESET
      </Button>
    </Box>
  );
};
