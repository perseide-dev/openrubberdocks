export const STORAGE_DRIVER_TOKEN = 'STORAGE_DRIVER_INSTANCE';

export const DEFAULT_WORKSPACE_QUOTA_BYTES = 524_288_000; // 500 MB
export const DEFAULT_MAX_FILE_BYTES = 26_214_400; // 25 MB per file upload
export const DEFAULT_LOCAL_STORAGE_PATH = './storage-data';
export const DEFAULT_S3_BUCKET = 'openrubberdocks-storage';
export const DEFAULT_S3_REGION = 'us-east-1';

export const STORAGE_ERRORS_CONSTANTS = {
    ATTACHMENT_NOT_FOUND: () => 'Storage attachment not found.',
    WORKSPACE_NOT_FOUND: () => 'Workspace not found for storage operation.',
    FILE_REQUIRED: () => 'A valid binary file is required.',
    QUOTA_EXCEEDED: (usedBytes: number, quotaBytes: number) =>
        `Workspace storage quota exceeded (${usedBytes} / ${quotaBytes} bytes).`,
    FILE_TOO_LARGE: (maxBytes: number) =>
        `Uploaded file exceeds maximum allowed size (${maxBytes} bytes).`,
    FORBIDDEN_WORKSPACE_READ: () =>
        'You do not have permission to read attachments in this workspace.',
    FORBIDDEN_WORKSPACE_WRITE: () =>
        'You do not have permission to upload or modify attachments in this workspace.',
    INVALID_STORAGE_KEY: () => 'Invalid or unsafe storage key.',
} as const;
