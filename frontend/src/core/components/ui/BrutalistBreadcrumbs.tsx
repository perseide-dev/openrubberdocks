import React from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';
import type { BrutalistBreadcrumbsProps } from '@components/ui/types/breadcrumbs.types';

/**
 * Digital Brutalist breadcrumbs navigation component.
 * Displays page ancestor hierarchy with monospace typography and strict technical geometry.
 */
export const BrutalistBreadcrumbs: React.FC<BrutalistBreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: 1 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'divider' }} />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.href) {
            return (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: isLast ? 'text.primary' : 'text.secondary',
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              underline="hover"
              component="button"
              type="button"
              onClick={() => item.href && navigate(item.href)}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                color: 'text.secondary',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                padding: 0,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};
