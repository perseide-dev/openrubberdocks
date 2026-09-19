// src/layout/ProtectedLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, IconButton, Divider, Drawer,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Collapse
} from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '@global-hooks/useAuth';

export type NavHandle = {
  label: string;
  icon?: React.ElementType;
};

interface ProtectedLayoutProps {
  navRoutes: RouteObject[]; // <- Acepta las rutas de AppRouter
}

export function ProtectedLayout({ navRoutes }: ProtectedLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // Función constructora de paths seguros
  const buildPath = (parentPath: string, currentPath?: string) => {
    if (!currentPath) return parentPath;
    if (currentPath.startsWith('/')) return currentPath;
    return parentPath === '/' ? `/${currentPath}` : `${parentPath}/${currentPath}`;
  };

  // FUNCIÓN RECURSIVA QUE "CHUPA" LAS RUTAS
  const renderNavItems = (routes: RouteObject[], basePath = '', level = 0) => {
    return routes.map((route, index) => {
      const handle = route.handle as NavHandle | undefined;

      // Si no tiene handle.label, lo ignoramos en el menú
      if (!handle || !handle.label) return null;

      const fullPath = buildPath(basePath, route.path);
      const IconComponent = handle.icon || CircleIcon;

      // Filtrar subrutas que tengan label
      const validChildren = route.children?.filter(child => (child.handle as NavHandle)?.label) || [];
      const hasChildren = validChildren.length > 0;

      const isActive = location.pathname === fullPath || (route.index && location.pathname === basePath);
      const isParentActive = location.pathname.startsWith(`${fullPath}/`);
      const isOpen = openMenus[fullPath] ?? isParentActive;

      return (
        <Box key={fullPath || index}>
          <ListItem disablePadding sx={{ marginBottom: 1 }}>
            <ListItemButton
              onClick={() => hasChildren ? toggleMenu(fullPath) : handleNavigate(fullPath)}
              sx={{
                border: '1.5px solid',
                borderColor: isActive ? 'primary.main' : 'divider',
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': { backgroundColor: isActive ? 'primary.main' : 'action.hover' },
                paddingY: 1.25,
                paddingLeft: 2 + level * 2,
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit', minWidth: 36 }}>
                <IconComponent sx={{ fontSize: level > 0 ? '1rem' : '1.25rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="button" sx={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.85rem', display: 'block' }}>
                    {handle.label}
                  </Typography>
                }
              />
              {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
            </ListItemButton>
          </ListItem>

          {hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNavItems(validChildren, fullPath, level + 1)}
              </List>
            </Collapse>
          )}
        </Box>
      );
    });
  };

  const renderNavList = () => <List sx={{ padding: 0 }}>{renderNavItems(navRoutes)}</List>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
      <Box component="header" sx={{ /* tu diseño actual */ paddingX: { xs: 2, md: 3 }, paddingY: 1.5, borderBottom: '2px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        {/* Tu código actual del Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setMobileDrawerOpen(true)} size="small">
            <MenuOutlinedIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>OPENRUBBERDOCKS</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>// WORKSPACE TEMPLATE // 2026</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip icon={<TerminalOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />} label={`@${user?.rubberHandle || 'unknown'}`} variant="outlined" size="small" />
          <Button variant="outlined" size="small" onClick={handleLogout} endIcon={<LogoutOutlinedIcon fontSize="small" />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>DISCONNECT</Button>
          <IconButton onClick={handleLogout} size="small" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}><LogoutOutlinedIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box component="nav" sx={{ width: 260, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', borderRight: '2px solid', borderColor: 'divider', padding: 2.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>// PROTOCOL NAVIGATION</Typography>
            {renderNavList()}
          </Box>
        </Box>

        <Drawer anchor="left" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, padding: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>NAVIGATION</Typography>
            <IconButton onClick={() => setMobileDrawerOpen(false)} size="small"><LogoutOutlinedIcon fontSize="small" /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {renderNavList()}
        </Drawer>

        <Box component="main" sx={{ flex: 1, padding: { xs: 2, sm: 3, md: 4 }, overflowY: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}