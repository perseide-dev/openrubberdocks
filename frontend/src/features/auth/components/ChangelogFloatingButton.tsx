import { Button } from '@mui/material';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';

interface ChangelogFloatingButtonProps {
  onClick: () => void;
}

export function ChangelogFloatingButton({ onClick }: ChangelogFloatingButtonProps) {
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
      // CHANGELOG [v0.1.0]
    </Button>
  );
}
