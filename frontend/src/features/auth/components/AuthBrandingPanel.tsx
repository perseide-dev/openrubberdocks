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
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AllInclusiveOutlinedIcon from '@mui/icons-material/AllInclusiveOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';

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
            // OPENRUBBERDOCKS // SELF-HOSTED DEV DOCS
          </Typography>
          <Chip
            icon={<AllInclusiveOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
            label="100% FREE & SELF-HOSTED"
            size="small"
            color="primary"
          />
        </Box>

        <Divider />

        <Box sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            DOCUMENTATION
            <br />
            WITHOUT
            <br />
            SAAS LOCK-IN
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            A centralized, clear and accessible documentation engine built to document internal systems,
            client handoffs, and engineering architecture. Deploy on your own VPS with complete data sovereignty
            and zero recurring monthly bills.
          </Typography>
        </Box>
      </Box>

      {/* Middle value propositions & roadmap */}
      <Box sx={{ my: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<DnsOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="ZERO PER-SEAT PRICING"
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<LayersOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="MODULAR CONTENT BLOCKS"
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<AccountTreeOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
            label="PROCESS MAPS & FLOWS [UPCOMING]"
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Real Product Comparison & Specs Table */}
        <Table size="small" aria-label="product value proposition">
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', width: '38%' }}>
                // HOSTING_MODEL
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                SELF-HOSTED (YOUR VPS // YOUR DOCKER)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // COST_STRUCTURE
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                FREE FOREVER // NO MONTHLY SAAS FEES
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // CORE_EXPERIENCE
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                MODULAR BLOCK-BY-BLOCK DOCUMENTATION
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // DESIGNED_FOR
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                IN-HOUSE TEAMS, AGENCIES & FREELANCERS
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // NEXT_HORIZON
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                PROCESS FLOW MAPS & INTERACTIVE DIAGRAMS
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>
                // DATA_OWNERSHIP
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                100% PRIVATE & STORED ON YOUR DATABASE
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Footer value statement */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          YOUR CODE // YOUR SERVERS // YOUR KNOWLEDGE
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          NO SUBSCRIPTIONS // NO VENDOR TIE-IN
        </Typography>
      </Box>
    </Box>
  );
}
