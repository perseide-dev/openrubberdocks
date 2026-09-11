import type { ThemeColors } from './colors.interface';

/**
 * CUSTOM COLORS TEMPLATE
 * 
 * To use custom colors:
 * 1. Copy this file to `src/core/theme/colors.ts`:
 *    `cp src/core/theme/colors.example.ts src/core/theme/colors.ts`
 * 2. Edit values as desired.
 * 3. Note: `colors.ts` is in .gitignore so local modifications are not tracked.
 *    If `colors.ts` is deleted or absent, the theme automatically falls back to defaultColors.
 */
export const colors: Partial<ThemeColors> = {
  primary: {
    main: '#000000',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFE600', // Electric yellow accent from brutalist studio theme
    contrastText: '#000000',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
    subtle: '#F4F4F0',
  },
  accents: {
    yellow: '#FFE600', // "START A PROJECT", "AVAILABLE FOR NEW PROJECTS"
    orange: '#FF5522', // High-voltage orange
    red: '#FF3B30',    // Bold brutalist red / vermillion ("GRIDLINE STUDIO")
    blue: '#0066FF',
    green: '#00CC66',
  },
};

export default colors;
