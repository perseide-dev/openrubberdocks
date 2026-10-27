import { Outlet, type RouteObject } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { UsersAdminPage } from '@features/admin/users/pages/UsersAdminPage';
import { RolesAdminPage } from '@features/admin/roles/pages/RolesAdminPage';
import { ApiKeysAdminPage } from '@features/admin/api-keys/pages/ApiKeysAdminPage';
import { AuditLogsAdminPage } from '@features/admin/audit-logs/pages/AuditLogsAdminPage';
import { ScopedRouteGuard } from '@routes/ScopedRouteGuard';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';

export const AdminRouter: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <ScopedRouteGuard
        requiredPermissions={[
          BASE_PERMISSIONS_ACTIONS.ROLE_ASSIGN,
          BASE_PERMISSIONS_ACTIONS.ROLE_READ,
          BASE_PERMISSIONS_ACTIONS.ROLE_CREATE,
          BASE_PERMISSIONS_ACTIONS.GLOBAL_AUDIT,
        ]}
        redirectTo="/workspaces"
      >
        <Outlet />
      </ScopedRouteGuard>
    ),
    handle: {
      label: '// RBAC',
      icon: AdminPanelSettingsOutlinedIcon,
    },
    children: [
      {
        path: 'users',
        element: (
          <ScopedRouteGuard
            requiredPermissions={[BASE_PERMISSIONS_ACTIONS.ROLE_ASSIGN]}
            redirectTo="/workspaces"
          >
            <UsersAdminPage />
          </ScopedRouteGuard>
        ),
        handle: {
          label: '// USERS',
          icon: PeopleAltOutlinedIcon,
        },
      },
      {
        path: 'roles',
        element: (
          <ScopedRouteGuard
            requiredPermissions={[
              BASE_PERMISSIONS_ACTIONS.ROLE_READ,
              BASE_PERMISSIONS_ACTIONS.ROLE_CREATE,
              BASE_PERMISSIONS_ACTIONS.ROLE_ASSIGN,
            ]}
            redirectTo="/workspaces"
          >
            <RolesAdminPage />
          </ScopedRouteGuard>
        ),
        handle: {
          label: '// ROLES',
          icon: SecurityOutlinedIcon,
        },
      },
      {
        path: 'api-keys',
        element: (
          <ScopedRouteGuard
            requiredPermissions={[
              BASE_PERMISSIONS_ACTIONS.ROLE_ASSIGN,
              BASE_PERMISSIONS_ACTIONS.ROLE_CREATE,
            ]}
            redirectTo="/workspaces"
          >
            <ApiKeysAdminPage />
          </ScopedRouteGuard>
        ),
        handle: {
          label: '// MCP KEYS',
          icon: VpnKeyOutlinedIcon,
        },
      },
      {
        path: 'audit-logs',
        element: (
          <ScopedRouteGuard
            requiredPermissions={[BASE_PERMISSIONS_ACTIONS.AUDIT_GLOBAL]}
            redirectTo="/workspaces"
          >
            <AuditLogsAdminPage />
          </ScopedRouteGuard>
        ),
        handle: {
          label: '// AUDIT LOGS',
          icon: HistoryOutlinedIcon,
        },
      },
    ],
  },
];
