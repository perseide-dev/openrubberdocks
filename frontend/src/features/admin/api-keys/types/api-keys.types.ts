export interface ApiKeyItem {
  id: string | number;
  uuid: string;
  name: string;
  keyPrefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
  rawKey?: string;
}

export interface CreateApiKeyPayload extends Record<string, unknown> {
  name: string;
  expiresInDays?: number;
}

export interface ApiKeysTableProps {
  keys: ApiKeyItem[];
  onRevoke: (key: ApiKeyItem) => void;
  onDelete: (key: ApiKeyItem) => void;
}

export interface CreateApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (rawKey: string, keyName: string) => void;
}

export interface TokenDisplayModalProps {
  open: boolean;
  rawKey: string | null;
  keyName: string;
  onClose: () => void;
}
