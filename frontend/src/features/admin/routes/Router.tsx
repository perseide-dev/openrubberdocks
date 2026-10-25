import { Outlet, type RouteObject } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { UsersAdminPage } from '@features/admin/users/pages/UsersAdminPage';
import { RolesAdminPage } from '@features/admin/roles/pages/RolesAdminPage';
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
        element: <UsersAdminPage />,
        handle: {
          label: '// USERS',
          icon: PeopleAltOutlinedIcon,
        },
      },
      {
        path: 'roles',
        element: <RolesAdminPage />,
        handle: {
          label: '// ROLES',
          icon: SecurityOutlinedIcon,
        },
      },
    ],
  },
];
