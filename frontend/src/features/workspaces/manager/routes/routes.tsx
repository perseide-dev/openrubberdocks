import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export const workspace = {
    dashboard: {
        route: '/workspaces',
        label: '// DASHBOARD',
        icon: WorkspacesIcon
    },
    detail: {
        route: '/workspaces/:uuid',
        label: '// WORKSPACE',
        icon: DescriptionOutlinedIcon
    }

} as const;
