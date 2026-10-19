import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { Can } from '@components/ui';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { PageTreeItemProps, PageTreeNode } from '@features/workspaces/files/types/file.types';

export const PageTreeItem: React.FC<PageTreeItemProps> = ({
  node,
  activeFileUuid,
  workspaceUuid,
  onSelectPage,
  onCreateSubPage,
}) => {
  const isDescendantActive = useMemo(() => {
    if (!activeFileUuid) return false;
    const checkDescendant = (n: PageTreeNode): boolean => {
      return n.children.some(
        (c) => c.file.uuid === activeFileUuid || checkDescendant(c)
      );
    };
    return checkDescendant(node);
  }, [node, activeFileUuid]);

  const [collapsed, setCollapsed] = useState(false);
  const isOpen = !collapsed || isDescendantActive;

  const isActive = activeFileUuid === node.file.uuid;
  const hasChildren = node.children.length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        onClick={() => onSelectPage(node.file.uuid)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          paddingY: 0.5,
          paddingRight: 1,
          paddingLeft: 1 + node.level * 1.5,
          border: '1.5px solid',
          borderColor: isActive ? 'primary.main' : 'transparent',
          backgroundColor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'primary.contrastText' : 'text.primary',
          cursor: 'pointer',
          marginBottom: 0.5,
          transition: 'background-color 0.15s, border-color 0.15s',
          '&:hover': {
            backgroundColor: isActive ? 'primary.main' : 'action.hover',
            borderColor: isActive ? 'primary.main' : 'divider',
            '& .tree-add-btn': {
              opacity: 1,
            },
          },
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(isOpen);
            }}
            sx={{
              padding: 0.25,
              color: isActive ? 'primary.contrastText' : 'inherit',
            }}
          >
            {isOpen ? (
              <ExpandLess sx={{ fontSize: '1rem' }} />
            ) : (
              <ExpandMore sx={{ fontSize: '1rem' }} />
            )}
          </IconButton>
        ) : (
          <Box
            sx={{
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                color: isActive ? 'primary.contrastText' : 'text.disabled',
                fontSize: '0.65rem',
              }}
            >
              //
            </Typography>
          </Box>
        )}

        {node.file.icon ? (
          <Typography
            sx={{
              fontSize: '1rem',
              lineHeight: 1,
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            {node.file.icon}
          </Typography>
        ) : (
          <DescriptionOutlinedIcon
            sx={{
              fontSize: '1rem',
              flexShrink: 0,
              color: isActive ? 'primary.contrastText' : 'text.secondary',
            }}
          />
        )}

        <Typography
          variant="body2"
          noWrap
          sx={{
            flex: 1,
            fontFamily: 'monospace',
            fontWeight: isActive ? 700 : 500,
            fontSize: '0.8rem',
            letterSpacing: '0.02em',
          }}
        >
          {node.file.title || 'UNTITLED_FILE'}
        </Typography>

        <Can
          action={BASE_PERMISSIONS_ACTIONS.DOCUMENT_WRITE}
          scope={workspaceUuid}
        >
          <IconButton
            size="small"
            className="tree-add-btn"
            title="Create sub-file"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSubPage?.(node.file.uuid);
            }}
            sx={{
              opacity: 0,
              padding: 0.25,
              color: isActive ? 'primary.contrastText' : 'text.secondary',
              '&:hover': {
                color: isActive ? 'primary.contrastText' : 'primary.main',
              },
            }}
          >
            <AddIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        </Can>
      </Box>

      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {node.children.map((child) => (
              <PageTreeItem
                key={child.file.uuid}
                node={child}
                activeFileUuid={activeFileUuid}
                workspaceUuid={workspaceUuid}
                onSelectPage={onSelectPage}
                onCreateSubPage={onCreateSubPage}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
