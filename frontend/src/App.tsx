import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Chip,
  Switch,
  Tabs,
  Tab,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [switchChecked, setSwitchChecked] = useState(true);

  return (
    <Box sx={{ minHeight: '100vh', padding: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="overline">// OPENRUBBERDOCKS // SYS_VER_2026</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label="ONLINE" />
          <IconButton size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Hero Poster Layout Inspired by Digital Brutalist Mockup */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Main Content Card */}
        <Card>
          <CardHeader
            title="PROJECT # 765"
            subheader="// CONTEMPORARY DIGITAL BRUTALISM // 2026"
            action={
              <Button variant="contained" size="small" endIcon={<AddIcon />}>
                NEW ENTRY
              </Button>
            }
          />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info">
              MUI theme active: All borders, typography, hard shadows, and zero-radius styling are applied globally via ThemeProvider.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained">PRIMARY ACTION</Button>
              <Button variant="outlined" endIcon={<ArrowForwardIcon />}>OUTLINED</Button>
              <Button variant="text">TEXT BUTTON</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="// DESIGNER_" placeholder="Enter handle..." fullWidth />
              <TextField label="// WORKSPACE_" placeholder="ws-production-01" fullWidth />
            </Box>

            {/* Technical Specifications Table */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>PARAM_KEY</TableCell>
                  <TableCell>VALUE</TableCell>
                  <TableCell align="right">STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>// THEME_</TableCell>
                  <TableCell>CONTEMPORARY BRUTALIST</TableCell>
                  <TableCell align="right"><Chip label="ACTIVE" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>// RADIUS_</TableCell>
                  <TableCell>0px STRICT</TableCell>
                  <TableCell align="right"><Chip label="LOCKED" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>// SHADOWS_</TableCell>
                  <TableCell>NONE (PURE FLAT WIREFRAME)</TableCell>
                  <TableCell align="right"><Chip label="FLAT" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">// WIREFRAME_MODE_</Typography>
              <Switch checked={switchChecked} onChange={(e) => setSwitchChecked(e.target.checked)} />
            </Box>
            <Button variant="outlined" size="small">
              EXPORT DATA
            </Button>
          </CardActions>
        </Card>

        {/* Sidebar Panel */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardHeader title="NAVIGATION" subheader="// SYSTEM TABS" />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                <Tab label="ALL" />
                <Tab label="LOGS" />
                <Tab label="METRICS" />
              </Tabs>
              <Typography variant="body2">
                No inline border or color styles were added to these components. The layout only uses Flexbox and Grid dimensions.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="TRENDS #2026" subheader="// MONOCHROME WIREFRAME" />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h4">DIGITAL MINIMALISM</Typography>
              <Typography variant="caption">
                GLOBAL TRENDS // DESIGN TRENDS // USE IT // LOVE IT // IN TREND OR ARCHIVED.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="UI/UX" />
                <Chip label="AI-CREATOR" />
                <Chip label="FREELANCER" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
