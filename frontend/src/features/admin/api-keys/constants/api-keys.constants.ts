export const API_KEYS_ENDPOINTS = {
  LIST: '/api-keys',
  CREATE: '/api-keys',
  REVOKE: (uuid: string) => `/api-keys/${uuid}/revoke`,
  DELETE: (uuid: string) => `/api-keys/${uuid}`,
};

export const API_KEYS_QUERY_KEYS = {
  ALL: ['api-keys'] as const,
};

export const API_KEYS_RESOURCE_TYPE = 'api-keys';

export const API_KEYS_MESSAGES = {
  TITLE: '// MCP_TOKENS',
  SUBTITLE: '// AI_AGENT_ACCESS_CONTROL',
  GENERATE_BUTTON: '+ GENERATE MCP KEY',
  CREATE_KEY_TITLE: '// GENERATE_AGENT_TOKEN',
  CREATE_KEY_DESC:
    'Generate a Personal Access Token (PAT) for external AI agents (Cursor, Claude Desktop, Antigravity, or custom agents) to connect via MCP HTTP/SSE.',
  TOKEN_CREATED_TITLE: '// TOKEN_GENERATED_SUCCESSFULLY',
  TOKEN_CREATED_WARNING:
    'COPY THIS TOKEN NOW. For security reasons, it will never be displayed again.',
  NO_KEYS_FOUND: '// NO_API_KEYS_FOUND',
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
  CONFIRM_REVOKE: 'Are you sure you want to revoke this API key? Connected AI agents will immediately lose access.',
  CONFIRM_DELETE: 'Are you sure you want to permanently delete this key record?',
  REVOKE_CONFIRM_TITLE: (name: string) => `REVOKE KEY // ${name}`,
  REVOKE_CONFIRM_DESC: (name: string) => `Are you sure you want to revoke key "${name}"? Connected AI agents using this token will immediately lose access.`,
  DELETE_CONFIRM_TITLE: (name: string) => `DELETE KEY RECORD // ${name}`,
  DELETE_CONFIRM_DESC: (name: string) => `Are you sure you want to permanently delete the record for "${name}"? This action cannot be undone.`,
  FILTER_PLACEHOLDER: 'Filter by key name or prefix...',
};
