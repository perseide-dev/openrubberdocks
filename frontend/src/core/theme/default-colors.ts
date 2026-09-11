import type { ThemeColors } from './colors.interface';

/**
 * Default high-contrast monochrome digital brutalist palette.
 * Used when no custom colors.ts file is provided in the repository.
 */
export const defaultColors: ThemeColors = {
  primary: {
    main: '#000000',
    light: '#222222',
    dark: '#000000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#F0F0F0',
    contrastText: '#000000',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    subtle: '#F5F5F3',
  },
  text: {
    primary: '#000000',
    secondary: '#444444',
    disabled: '#888888',
  },
  border: {
    main: '#000000',
    light: '#E5E5E5',
  },
  accents: {
    yellow: '#FFE600',
    orange: '#FF5522',
    red: '#FF3B30',
    blue: '#0066FF',
    green: '#00CC66',
  },
  status: {
    error: '#D32F2F',
    warning: '#F57C00',
    info: '#0288D1',
    success: '#2E7D32',
  },
};
