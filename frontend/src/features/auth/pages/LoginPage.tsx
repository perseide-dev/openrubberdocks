import { useState } from 'react';
import { Box } from '@mui/material';
import {
  AuthBrandingPanel,
  LoginForm,
  ChangelogFloatingButton,
  ChangelogModal,
} from '@features/auth/components';

export function LoginPage() {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        backgroundColor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Left Column: Digital Brutalist Architectural Panel */}
      <AuthBrandingPanel />

      {/* Right Column: Authentication Form Container */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2.5, sm: 4, md: 6 },
          backgroundColor: 'background.default',
        }}
      >
        <LoginForm />
      </Box>

      {/* Floating Action Button & Changelog Modal */}
      <ChangelogFloatingButton onClick={() => setIsChangelogOpen(true)} />
      <ChangelogModal
        open={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </Box>
  );
}
