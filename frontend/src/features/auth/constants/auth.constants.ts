import type { ChangelogItem, LoginFormState } from '@features/auth/types/auth.types';

export const AUTH_DEFAULTS = {
  STALE_TIME: 5 * 60 * 1000,
} as const;

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
    version: 'v0.0.9',
    date: '2026-10-26',
    status: 'EARLY_ACCESS',
    title: 'v0.0.9 "Curious Momotus" // Early Access Genesis Release to Main',
    highlights: [
      'Codename: "Curious Momotus" — Official First Public Release',
      'Contemporary Digital Brutalism Flat Wireframe Theme (MUI 9+ with 90° Geometry)',
      'Engine-Level Scoped RBAC Security (coreAdmin, internal, external read-only lock)',
      'HttpOnly Cookie-based Authentication & Silent JWT Refresh Rotation',
      'Interactive TUI Installer, CORS Wizard & One-Command System Updater (--update)',
      'VPS Hardening (Strict 127.0.0.1 loopback binding preventing Docker iptables bypass)',
      'Full Docker Compose Architecture (Backend, DB, Nginx Frontend SPA) & MCP AI Agent Server',
    ],
    details: [
      {
        category: 'FOUNDATION',
        description: 'First public Early Access release of OpenRubberDocks codenamed "Curious Momotus". Full-stack modular DDD architecture with NestJS, TypeORM, PostgreSQL, and React 19.',
      },
      {
        category: 'THEME',
        description: 'Contemporary Digital Brutalism design system: 0px border-radius, zero drop shadows, solid 1.5px technical wireframes, Space Grotesk/Mono typography, and dynamic colors.ts override.',
      },
      {
        category: 'SECURITY',
        description: 'Contextual Scoped RBAC engine, engine-level mutation lock for external users, 256-bit JWT secret generation, and secure httpOnly cookies eliminating client-side token storage.',
      },
      {
        category: 'NETWORKING',
        description: 'Interactive CLI wizard with zero-code CORS configuration, loopback firewall protections against iptables leaks, and automated single-command updates from main branch.',
      },
      {
        category: 'AI & EXTENSIBILITY',
        description: 'Integrated Model Context Protocol (MCP) server ready for autonomous AI agents, tool invocation, and scoped workspace interaction.',
      },
    ],
  },
];
