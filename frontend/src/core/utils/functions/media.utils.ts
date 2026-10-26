import type { SxProps, Theme } from '@mui/material';

/**
 * Validates and sanitizes an image URL to prevent XSS (javascript:/data:text/html) and CSS injection.
 * Allows only https://, http://, relative paths starting with /, and safe base64 image data URIs.
 */
export function sanitizeImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const isAllowedProtocol =
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    /^data:image\/(svg\+xml|png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(trimmed);

  if (!isAllowedProtocol) {
    return null;
  }

  // Escape characters that could break out of CSS url("...") or HTML attributes
  return trimmed.replace(/["'()\\\r\n]/g, (ch) => `\\${ch}`);
}

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
    /^#([0-9a-fA-F]{3,8})$/.test(trimmed) ||
    (/^(rgb|rgba|hsl)\([0-9.,%\s/]+\)$/.test(trimmed))
  ) {
    return {
      backgroundColor: trimmed,
    };
  }

  // 2. CSS Linear or Radial Gradients (reject any embedded url() or CSS block breakouts)
  if (
    (trimmed.startsWith('linear-gradient(') ||
      trimmed.startsWith('radial-gradient(') ||
      trimmed.startsWith('conic-gradient(')) &&
    !/[;{}<>\\]|url\s*\(/i.test(trimmed)
  ) {
    return {
      backgroundImage: trimmed,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  // 3. Image URLs or Base64 Data URIs
  const rawUrl = trimmed.startsWith('url(') && trimmed.endsWith(')')
    ? trimmed.slice(4, -1).trim().replace(/^['"]|['"]$/g, '')
    : trimmed;

  const safeUrl = sanitizeImageUrl(rawUrl);
  if (!safeUrl) {
    return {};
  }

  return {
    backgroundImage: `url("${safeUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}
