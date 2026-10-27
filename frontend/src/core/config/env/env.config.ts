export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
