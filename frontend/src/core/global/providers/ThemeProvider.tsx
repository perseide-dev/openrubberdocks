import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { brutalistTheme } from '@theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Global ThemeProvider wrapping the application with the contemporary digital brutalist MUI theme
 * and applying CssBaseline for global resets and custom square scrollbars.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={brutalistTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
