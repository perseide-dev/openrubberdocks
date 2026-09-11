import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import { useLoginForm } from '@features/auth/hooks/useLoginForm';

export function LoginForm() {
  const {
    formState,
    errorMessage,
    isSubmitting,
    handleHandleChange,
    handlePwdChange,
    handleTogglePassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 480,
        margin: 'auto',
      }}
    >
      <Card>
        <CardHeader
          title="IDENTITY AUTHORIZATION"
          subheader="// SUPPLY CREDENTIALS TO ACCESS WORKSPACE"
          action={
            <Box sx={{ padding: 1 }}>
              <KeyOutlinedIcon fontSize="small" />
            </Box>
          }
        />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {errorMessage && (
            <Alert severity="error" variant="filled">
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {/* Rubber Handle Input */}
            <TextField
              id="rubber-handle-input"
              label="// RUBBER_HANDLE"
              placeholder="e.g. coreAdmin or @handle"
              value={formState.rubberHandle}
              onChange={handleHandleChange}
              disabled={isSubmitting}
              autoComplete="username"
              autoFocus
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Password Input */}
            <TextField
              id="password-input"
              label="// PASSWORD"
              type={formState.showPassword ? 'text' : 'password'}
              placeholder="Enter your security phrase"
              value={formState.pwd}
              onChange={handlePwdChange}
              disabled={isSubmitting}
              autoComplete="current-password"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                      >
                        {formState.showPassword ? (
                          <VisibilityOffOutlinedIcon fontSize="small" />
                        ) : (
                          <VisibilityOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              endIcon={
                isSubmitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <LoginOutlinedIcon />
                )
              }
              fullWidth
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'ENTER PROTOCOL'}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              RBAC SCOPE: WORKSPACE_STRICT
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ENCRYPT: BCRYPT_2B
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
