import {
  Box,
} from '@mui/material';
import { HeaderDashboardPage } from '@features/workspaces/manager/components/HeaderDashboardPage';
import { CardListDashboardPage } from '@features/workspaces/manager/components/CardListDashboardPage';



export function DashboardPage() {


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <HeaderDashboardPage />
      <CardListDashboardPage />
    </Box>
  );
}
