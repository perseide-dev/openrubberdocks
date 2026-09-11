import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import { useAuth } from '@global-hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Banner Card */}
      <Card>
        <CardHeader
          title={`WELCOME // @${user?.rubberHandle || 'OPERATOR'}`}
          subheader={`// USER_UUID: ${user?.uuid || 'LOCAL_SESSION'} // ROLE: ${user?.type?.toUpperCase() || 'INTERNAL'}`}
          action={
            <Box sx={{ display: 'flex', gap: 1, padding: 1 }}>
              <Chip label="SESSION_ACTIVE" color="primary" size="small" />
              <Chip label="RBAC_ENFORCED" variant="outlined" size="small" />
            </Box>
          }
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            You are now inside the protected application shell. This layout encapsulates navigation, telemetry status,
            and global authentication controls built according to the <strong>Contemporary Digital Brutalism</strong> guidelines.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />}>
              CREATE WORKSPACE
            </Button>
            <Button variant="outlined" startIcon={<SecurityOutlinedIcon />}>
              AUDIT RBAC LOGS
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Metrics & System Parameters Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
        <Card>
          <CardHeader
            title="ACTIVE SPACES"
            subheader="// ALLOCATED WORKSPACES"
            avatar={<LayersOutlinedIcon />}
          />
          <CardContent>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              01
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              PRIMARY DOCK INSTANCE
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="ENCLAVE ROLE"
            subheader="// ACCESS PERMISSION"
            avatar={<SecurityOutlinedIcon />}
          />
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {user?.type?.toUpperCase() || 'INTERNAL'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              FULL ENGINE SCOPE
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="COOKIE ENGINE"
            subheader="// SILENT ROTATION"
            avatar={<TerminalOutlinedIcon />}
          />
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              ACTIVE
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              15M ACCESS // 7D REFRESH
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Active Session Telemetry Table */}
      <Card>
        <CardHeader
          title="SESSION SPECIFICATIONS"
          subheader="// LIVE RUNTIME ENVIRONMENT METADATA"
        />
        <Divider />
        <CardContent sx={{ padding: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SPECIFICATION_KEY</TableCell>
                <TableCell>PARAMETER_VALUE</TableCell>
                <TableCell align="right">HEALTH_CHECK</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>// USERNAME</TableCell>
                <TableCell>{user?.username || 'N/A'}</TableCell>
                <TableCell align="right"><Chip label="VERIFIED" size="small" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>// RUBBER_HANDLE</TableCell>
                <TableCell>@{user?.rubberHandle || 'N/A'}</TableCell>
                <TableCell align="right"><Chip label="UNIQUE" size="small" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>// CLIENT_THEME</TableCell>
                <TableCell>CONTEMPORARY DIGITAL BRUTALISM (FLAT WIREFRAME)</TableCell>
                <TableCell align="right"><Chip label="LOCKED" size="small" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>// HTTP_TRANSPORT</TableCell>
                <TableCell>KY CLIENT WITH AUTH REFRESH INTERCEPTOR</TableCell>
                <TableCell align="right"><Chip label="OPERATIONAL" size="small" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
