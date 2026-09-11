import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import { useAuth } from '@global-hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: typeof DashboardOutlinedIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: '// DASHBOARD', path: '/dashboard', icon: DashboardOutlinedIcon },
  { label: '// WORKSPACES', path: '/workspaces', icon: LayersOutlinedIcon },
  { label: '// ACCESS_RBAC', path: '/settings/rbac', icon: SecurityOutlinedIcon },
];

export function ProtectedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const renderNavList = () => (
    <List sx={{ padding: 0 }}>
      {NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <ListItem key={item.path} disablePadding sx={{ marginBottom: 1 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                border: '1.5px solid',
                borderColor: isActive ? 'primary.main' : 'divider',
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.main' : 'action.hover',
                },
                paddingY: 1.25,
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? 'primary.contrastText' : 'inherit',
                  minWidth: 36,
                }}
              >
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="button"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      fontSize: '0.85rem',
                      display: 'block',
                    }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {/* Top Header Bar */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: { xs: 2, md: 3 },
          paddingY: 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={() => setMobileDrawerOpen(true)}
            size="small"
            aria-label="open mobile navigation"
          >
            <MenuOutlinedIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              OPENRUBBERDOCKS
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              // WORKSPACE TEMPLATE // 2026
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<TerminalOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label={`@${user?.rubberHandle || 'unknown'}`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={user?.type?.toUpperCase() || 'USER'}
            size="small"
            color="primary"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleLogout}
            endIcon={<LogoutOutlinedIcon fontSize="small" />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            DISCONNECT
          </Button>
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            aria-label="disconnect session"
          >
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Container: Sidebar + Outlet */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            width: 260,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '2px solid',
            borderColor: 'divider',
            padding: 2.5,
            backgroundColor: 'background.paper',
            boxSizing: 'border-box',
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              // PROTOCOL NAVIGATION
            </Typography>
            {renderNavList()}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              SECURITY: SCOPED_RBAC
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              TRANSPORT: HTTPONLY_ROTATION
            </Typography>
          </Box>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 280,
              padding: 2.5,
              backgroundColor: 'background.paper',
              borderRight: '2px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              NAVIGATION
            </Typography>
            <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {renderNavList()}
        </Drawer>

        {/* Dynamic Content Outlet */}
        <Box
          component="main"
          sx={{
            flex: 1,
            padding: { xs: 2, sm: 3, md: 4 },
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Telemetry Footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingX: { xs: 2, md: 3 },
          paddingY: 1,
          borderTop: '2px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          SYSTEM // OPENRUBBERDOCKS GATEWAY 2026
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          STATUS // ALL CHANNELS NOMINAL
        </Typography>
      </Box>
    </Box>
  );
}
