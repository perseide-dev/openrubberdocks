import type {
    BlockFilters,
    BlockType,
    BlockTypeOption,
    CalloutVariant,
    TableBlockData,
} from '@features-workspaces/files/types/block.types';

export const BLOCK_ENDPOINTS = {
    BASE: 'blocks',
    BY_UUID: (uuid: string) => `blocks/${uuid}`,
    MOVE: (uuid: string) => `blocks/${uuid}/move`,
    SYNC_FILE: (fileUuid: string) => `blocks/file/${fileUuid}`,
} as const;

export const BLOCK_RESOURCE_TYPE = 'blocks';

export const BLOCK_QUERY_KEYS = {
    ALL: ['blocks'] as const,
    LIST: (filters?: BlockFilters) => ['blocks', 'list', filters] as const,
    DETAIL: (uuid: string) => ['blocks', 'detail', uuid] as const,
} as const;

export const BLOCK_MUTATION_KEYS = {
    CREATE: ['blocks', 'create'] as const,
    UPDATE: ['blocks', 'update'] as const,
    MOVE: ['blocks', 'move'] as const,
    DELETE: ['blocks', 'delete'] as const,
    SYNC_FILE: ['blocks', 'sync-file'] as const,
} as const;

export const BLOCK_DEFAULTS = {
    STALE_TIME: 5 * 60 * 1000,
} as const;

export const BLOCK_TYPES: readonly BlockType[] = [
    'text',
    'heading_1',
    'heading_2',
    'heading_3',
    'bullet_list',
    'numbered_list',
    'todo',
    'image',
    'file_attachment',
    'table',
    'callout',
    'mermaid',
    'openapi_spec',
    'internal_link',
    'code',
    'quote',
    'divider',
] as const;

export const BLOCK_TYPE_OPTIONS: readonly BlockTypeOption[] = [
    { type: 'text', label: 'Text' },
    { type: 'heading_1', label: 'Heading 1' },
    { type: 'heading_2', label: 'Heading 2' },
    { type: 'heading_3', label: 'Heading 3' },
    { type: 'bullet_list', label: 'Bullet List' },
    { type: 'numbered_list', label: 'Numbered List' },
    { type: 'todo', label: 'To-do' },
    { type: 'image', label: 'Image (Drag & Drop / Paste)' },
    { type: 'file_attachment', label: 'File Attachment (Binary)' },
    { type: 'table', label: 'Table (Dynamic Grid / Markdown)' },
    { type: 'callout', label: 'Callout (Semantic Alert)' },
    { type: 'mermaid', label: 'Mermaid Diagram (Architecture / Flow)' },
    { type: 'openapi_spec', label: 'OpenAPI / JSON:API Spec' },
    { type: 'internal_link', label: 'Internal Link ([[ Doc / @ Task)' },
    { type: 'code', label: 'Code' },
    { type: 'quote', label: 'Quote' },
    { type: 'divider', label: 'Divider' },
] as const;

export const BLOCK_SLASH_TRIGGER = '/';

export const BLOCK_CONTENT_PLACEHOLDERS: Record<BlockType, string> = {
    text: "Type something, press '/' for blocks, or '[[' / '@' to link docs & tasks",
    heading_1: 'Heading 1',
    heading_2: 'Heading 2',
    heading_3: 'Heading 3',
    bullet_list: 'List item',
    numbered_list: 'List item',
    todo: 'To-do',
    image: 'Drop image, paste from clipboard, or enter image URL...',
    file_attachment: 'Drop binary file here or click UPLOAD BINARY...',
    table: '| Column 1 | Column 2 |\n| --- | --- |\n| Value 1 | Value 2 |',
    callout: 'Enter callout alert message...',
    mermaid: 'flowchart LR\n  Client["Frontend SPA"] --> API["NestJS JSON:API"]',
    openapi_spec: 'Paste OpenAPI 3.0 YAML or JSON specification...',
    internal_link: 'Search workspace document or task ([[ or @)...',
    code: 'Code',
    quote: 'Quote',
    divider: '',
};

export const CALLOUT_VARIANTS: readonly CalloutVariant[] = [
    'INFO',
    'WARNING',
    'DANGER',
    'SUCCESS',
] as const;

export const DEFAULT_TABLE_DATA: TableBlockData = {
    headers: ['FIELD', 'TYPE', 'DESCRIPTION'],
    rows: [
        ['uuid', 'uuid', 'Primary resource identifier'],
        ['status', 'enum', 'Operational state of the component'],
    ],
};

export const MERMAID_PRESETS: Record<string, { label: string; code: string }> = {
    architecture: {
        label: 'Architecture',
        code: `flowchart LR
  UI["Frontend (React 19)"] -->|"httpOnly JWT"| API["NestJS API"]
  API -->|"TypeORM"| DB[("PostgreSQL 15")]
  API -->|"S3 / Local"| STORAGE[("RustFS / Volume")]`,
    },
    sequence: {
        label: 'Sequence',
        code: `sequenceDiagram
  participant U as Client
  participant A as NestJS Guard
  participant S as StorageService
  U->>A: POST /storage/upload
  A->>S: Verify Quota & RBAC
  S-->>U: 201 Created (JSON:API)`,
    },
    er: {
        label: 'ER Schema',
        code: `erDiagram
  WORKSPACE ||--o{ PAGE : contains
  WORKSPACE ||--o{ STORAGE_ATTACHMENT : owns
  PAGE ||--o{ BLOCK : structures`,
    },
};

export const DEFAULT_OPENAPI_SPEC_SAMPLE = `openapi: 3.0.3
info:
  title: OpenRubberDocks Storage & Blocks API
  version: 1.0.0
  description: JSON:API v1.0 contract for hybrid binary storage and rich documentation blocks.
servers:
  - url: http://localhost:3000
paths:
  /storage/upload:
    post:
      summary: Upload binary attachment to Workspace
      tags:
        - Storage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                workspaceUuid:
                  type: string
                  format: uuid
                fileUuid:
                  type: string
                  format: uuid
                file:
                  type: string
                  format: binary
      responses:
        '201':
          description: Binary stored and quota updated
        '413':
          description: Workspace storage quota exceeded
  /storage/quota/{workspaceUuid}:
    get:
      summary: Inspect Workspace storage quota and usage
      tags:
        - Storage
      parameters:
        - name: workspaceUuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: JSON:API storage-quotas resource`;
