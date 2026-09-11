import { defaultColors } from './default-colors';
import type { ThemeColors } from './colors.interface';

/**
 * Dynamically and safely attempts to load local `colors.ts`.
 * Uses Vite's `import.meta.glob` with `eager: true`.
 * If `colors.ts` is absent (as it is in .gitignore), Vite returns an empty object {}
 * without throwing any module resolution error.
 */
const customColorModules = import.meta.glob<{
  default?: Partial<ThemeColors>;
  colors?: Partial<ThemeColors>;
}>('./colors.ts', { eager: true });

const customModule = customColorModules['./colors.ts'];
const customOverrides = customModule?.default || customModule?.colors || {};

export const activeColors: ThemeColors = {
  ...defaultColors,
  ...customOverrides,
  primary: {
    ...defaultColors.primary,
    ...(customOverrides.primary || {}),
  },
  secondary: {
    ...defaultColors.secondary,
    ...(customOverrides.secondary || {}),
  },
  background: {
    ...defaultColors.background,
    ...(customOverrides.background || {}),
  },
  text: {
    ...defaultColors.text,
    ...(customOverrides.text || {}),
  },
  border: {
    ...defaultColors.border,
    ...(customOverrides.border || {}),
  },
  accents: {
    ...defaultColors.accents,
    ...(customOverrides.accents || {}),
  },
  status: {
    ...defaultColors.status,
    ...(customOverrides.status || {}),
  },
};
