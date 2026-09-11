import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
  Button,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { CHANGELOG_DATA } from '@features/auth/constants/auth.constants';

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangelogModal({ open, onClose }: ChangelogModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="changelog-dialog-title"
      aria-describedby="changelog-dialog-description"
    >
      <DialogTitle
        id="changelog-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            SYSTEM RELEASES // CHANGELOG
          </Typography>
          <Chip label="LATEST: v0.1.0-alpha" size="small" color="primary" />
        </Box>
        <IconButton
          aria-label="close changelog modal"
          onClick={onClose}
          size="small"
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        id="changelog-dialog-description"
        sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxHeight: '70vh',
        }}
      >
        {CHANGELOG_DATA.map((item) => (
          <Box
            key={item.version}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              border: '1.5px solid',
              borderColor: 'divider',
              padding: 2.5,
              backgroundColor: 'background.paper',
            }}
          >
            {/* Entry Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {item.version}
                </Typography>
                <Chip label={item.status} size="small" variant="outlined" />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                RELEASED // {item.date}
              </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>

            <Divider />

            {/* Highlights */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                // ARCHITECTURAL HIGHLIGHTS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {item.highlights.map((hl) => (
                  <Box
                    key={hl}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <CheckCircleOutlineOutlinedIcon
                      fontSize="small"
                      color="primary"
                    />
                    <Typography variant="body2">{hl}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Detailed Categories */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                // TECHNICAL BREAKDOWN
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {item.details.map((detail) => (
                  <Box
                    key={detail.category}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      padding: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        display: 'block',
                        marginBottom: 0.5,
                      }}
                    >
                      [{detail.category}]
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {detail.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ padding: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', paddingLeft: 1 }}>
          OPENRUBBERDOCKS // ARTIFACT VERSIONING PROTOCOL
        </Typography>
        <Button variant="contained" onClick={onClose} size="small">
          ACKNOWLEDGE [ESC]
        </Button>
      </DialogActions>
    </Dialog>
  );
}
