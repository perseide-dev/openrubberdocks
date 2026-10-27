import { Button } from '@mui/material';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { CHANGELOG_DATA } from '@features/auth/constants/auth.constants';
import type { ChangelogFloatingButtonProps } from '@features/auth/types/auth.types';

export function ChangelogFloatingButton({ onClick }: ChangelogFloatingButtonProps) {
  const currentVersion = CHANGELOG_DATA[0]?.version || 'v0.0.9';

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={onClick}
      startIcon={<HistoryEduOutlinedIcon fontSize="small" />}
      aria-label="Open system changelog modal"
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: 1200,
        letterSpacing: '0.08em',
        backgroundColor: 'background.paper',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      // CHANGELOG [{currentVersion} // Curious Momotus]
    </Button>
  );
}
