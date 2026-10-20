import type { RouteObject } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { UsersAdminPage } from '@features/admin/users/pages/UsersAdminPage';
import { RolesAdminPage } from '@features/admin/roles/pages/RolesAdminPage';

export const AdminRouter: RouteObject[] = [
  {
    path: '/admin',
    handle: {
      label: '// ACCESS_CONTROL',
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
