import type { SxProps, Theme } from '@mui/material';

/**
 * Parses and returns the correct CSS background properties for a file cover.
 * Supports solid hex/rgb colors, CSS gradients, Base64 SVGs, and external image URLs.
 */
export function getCoverStyle(cover?: string | null): SxProps<Theme> {
  if (!cover) {
    return {};
  }

  const trimmed = cover.trim();

  // 1. Solid Hex / RGB / HSL colors
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('rgb(') ||
    trimmed.startsWith('rgba(') ||
    trimmed.startsWith('hsl(')
  ) {
    return {
      backgroundColor: trimmed,
    };
  }

  // 2. CSS Linear or Radial Gradients
  if (
    trimmed.startsWith('linear-gradient(') ||
    trimmed.startsWith('radial-gradient(') ||
    trimmed.startsWith('conic-gradient(')
  ) {
    return {
      backgroundImage: trimmed,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  // 3. Image URLs or Base64 Data URIs
  const urlValue = trimmed.startsWith('url(') ? trimmed : `url("${trimmed}")`;
  return {
    backgroundImage: urlValue,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}
