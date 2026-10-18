import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { Can } from '@components/ui';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import { useWorkspaceFilesService } from '@features/workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features/workspaces/manager/services/workspace.service';
import { buildPageTree } from '@utils-functions/tree.utils';
import { files as fileRoutes } from '@features/workspaces/files/routes/routes';
import { PageTreeItem } from '@features/workspaces/files/components/PageTreeItem';
import type { PageTreeSidebarProps } from '@features/workspaces/files/types/file.types';

export const PageTreeSidebar: React.FC<PageTreeSidebarProps> = ({
  workspaceUuid,
  activeFileUuid,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { data: workspaceData } = useWorkspaceDetailService(workspaceUuid);
  const { data: filesData = [], isLoading } = useWorkspaceFilesService(workspaceUuid);

  const pageTree = useMemo(() => {
    return buildPageTree(filesData);
  }, [filesData]);

  const handleBackToWorkspaces = () => {
    navigate('/workspaces');
    onCloseMobile?.();
  };

  const handleSelectPage = (fileUuid: string) => {
    navigate(fileRoutes.view.build(workspaceUuid, fileUuid));
    onCloseMobile?.();
  };

  const handleCreateSubPage = (parentPageUuid: string) => {
    navigate(`${fileRoutes.create.build(workspaceUuid)}?parent=${parentPageUuid}`);
    onCloseMobile?.();
  };

  const handleCreateRootPage = () => {
    navigate(fileRoutes.create.build(workspaceUuid));
    onCloseMobile?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Back to all workspaces */}
      <Button
        variant="text"
        size="small"
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={handleBackToWorkspaces}
        sx={{
          justifyContent: 'flex-start',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '0.04em',
          fontSize: '0.75rem',
          color: 'text.secondary',
          paddingX: 1,
          paddingY: 0.5,
          marginBottom: 1.5,
          '&:hover': {
            color: 'primary.main',
            backgroundColor: 'transparent',
          },
        }}
      >
        // ALL WORKSPACES
      </Button>

      {/* Workspace identity */}
      <Box sx={{ marginBottom: 2, paddingX: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            fontSize: '0.7rem',
            lineHeight: 1.2,
          }}
        >
          // ACTIVE WORKSPACE
        </Typography>
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginTop: 0.5,
          }}
        >
          {workspaceData?.name || 'WORKSPACE'}
        </Typography>
      </Box>

      {/* Action: Create root page */}
      <Can
        action={BASE_PERMISSIONS_ACTIONS.DOCUMENT_WRITE}
        scope={workspaceUuid}
      >
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<AddIcon fontSize="small" />}
          onClick={handleCreateRootPage}
          sx={{
            marginBottom: 2,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
          }}
        >
          + NEW ROOT FILE
        </Button>
      </Can>

      <Divider sx={{ marginBottom: 1.5 }} />

      {/* Files Section Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 1,
          paddingX: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'text.secondary',
          }}
        >
          // FILES_TREE ({filesData.length})
        </Typography>
      </Box>

      {/* File Tree list */}
      <Box sx={{ flex: 1, overflowY: 'auto', paddingRight: 0.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              // LOADING_FILES...
            </Typography>
          </Box>
        ) : pageTree.length === 0 ? (
          <Box sx={{ padding: 1.5, border: '1px dashed', borderColor: 'divider' }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontFamily: 'monospace',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              // NO_FILES_FOUND
            </Typography>
          </Box>
        ) : (
          pageTree.map((rootNode) => (
            <PageTreeItem
              key={rootNode.file.uuid}
              node={rootNode}
              activeFileUuid={activeFileUuid}
              workspaceUuid={workspaceUuid}
              onSelectPage={handleSelectPage}
              onCreateSubPage={handleCreateSubPage}
            />
          ))
        )}
      </Box>
    </Box>
  );
};
