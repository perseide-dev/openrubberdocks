import type { ChangelogItem, LoginFormState } from '../types/auth.types';

export const AUTH_ENDPOINTS = {
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',
  REFRESH: 'auth/refresh',
} as const;

export const AUTH_QUERY_KEYS = {
  ME: ['auth', 'me'] as const,
} as const;

export const AUTH_MUTATION_KEYS = {
  LOGIN: ['auth', 'login'] as const,
  LOGOUT: ['auth', 'logout'] as const,
} as const;

export const LOGIN_FORM_INITIAL_STATE: LoginFormState = {
  rubberHandle: '',
  pwd: '',
  showPassword: false,
};

export const AUTH_MESSAGES = {
  DEFAULT_ERROR: 'Authentication failed. Please verify your rubber handle and password.',
  UNAUTHORIZED: 'Invalid handle or password.',
  NETWORK_ERROR: 'Unable to reach the authentication gateway. Verify backend status.',
  SESSION_TERMINATED: 'Session closed successfully.',
} as const;

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v0.1.0-alpha',
    date: '2026-09-10',
    status: 'CURRENT_BUILD',
    title: 'Genesis Architecture & Contemporary Digital Brutalism',
    highlights: [
      'Contemporary Digital Brutalism Flat Wireframe Theme (MUI 9+)',
      'Scoped RBAC Engine (coreAdmin, internal, external)',
      'HttpOnly Cookie-based Authentication & Silent JWT Rotation',
      'Cross-Platform Terminal Wizard Installer (install.mjs / .sh / .bat)',
      '4-Tier Clean Architecture API Engine (Ky + TanStack Query)',
    ],
    details: [
      {
        category: 'THEME',
        description: 'Enforced 0px border-radius, zero hard/drop shadows, 1.5px solid wireframes, Space Grotesk & Space Mono typography with git-ignored dynamic colors override.',
      },
      {
        category: 'SECURITY',
        description: 'Silent token renewal interceptor with automatic retry on 401 and secure httpOnly cookies for both 15m Access and 7d Refresh tokens.',
      },
      {
        category: 'ARCHITECTURE',
        description: 'Canonical unidirectional flow: Repositories -> Services -> Hooks -> Components with strict Zero Inline Declarations compliance.',
      },
      {
        category: 'INSTALLER',
        description: 'Interactive CLI/TUI installer parametrizing ports, crypto secrets, coreAdmin handles, theme palettes, and seeders.',
      },
    ],
  },
];
