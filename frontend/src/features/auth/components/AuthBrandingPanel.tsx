import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

export function AuthBrandingPanel() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: { xs: 3, md: 5 },
        borderRight: { xs: 'none', md: '2px solid' },
        borderBottom: { xs: '2px solid', md: 'none' },
        borderColor: 'divider',
        backgroundColor: 'background.default',
        boxSizing: 'border-box',
      }}
    >
      {/* Header section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="overline" sx={{ letterSpacing: '0.15em' }}>
            // OPENRUBBERDOCKS // GATEWAY_2026
          </Typography>
          <Chip
            icon={<ShieldOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
            label="ENCLAVE LOCKED"
            size="small"
            color="primary"
          />
        </Box>

        <Divider />

        <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            CONTEMPORARY
            <br />
            BRUTALIST
            <br />
            ACCESS
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            // MULTI-TENANT RBAC PROTOCOL // REUSABLE DIGITAL WIREFRAME //
          </Typography>
        </Box>
      </Box>

      {/* Middle telemetry & architectural specs */}
      <Box sx={{ my: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<TerminalOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="HTTPONLY COOKIES"
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<MemoryOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="SILENT JWT ROTATION"
            size="small"
            variant="outlined"
          />
          <Chip label="SCOPED RBAC" size="small" variant="outlined" />
        </Box>

        {/* Telemetry Table */}
        <Table size="small" aria-label="system telemetry">
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', width: '40%' }}>
                // ARCHITECTURE
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                CLEAN DDD 4-TIER
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // USER_TYPES
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                CORE_ADMIN | INTERNAL | EXTERNAL
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // REFRESH_ENGINE
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                KY AFTER_RESPONSE_HOOK
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // SYSTEM_STATUS
              </TableCell>
              <TableCell align="right">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.8,
                    fontWeight: 700,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: 'success.main',
                      display: 'inline-block',
                    }}
                  />
                  STANDBY_OK
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Footer telemetry */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          HASH: SHA256 // AES-GCM
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          LOCAL_PORT // :3000 API
        </Typography>
      </Box>
    </Box>
  );
}
