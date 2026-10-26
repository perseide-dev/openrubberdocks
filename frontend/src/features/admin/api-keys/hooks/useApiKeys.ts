import { useState, useMemo } from 'react';
import {
  useApiKeysService,
  useCreateApiKeyService,
  useRevokeApiKeyService,
  useDeleteApiKeyService,
} from '@features/admin/api-keys/services/api-keys.service';
import type { ApiKeyItem } from '@features/admin/api-keys/types/api-keys.types';

export function useCreateApiKeyModal(
  onClose: () => void,
  onSuccess: (rawKey: string, name: string) => void,
) {
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<string>('30');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateApiKeyService();

  const handleClose = () => {
    if (createMutation.isPending) return;
    setName('');
    setExpiresInDays('30');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Token name is required.');
      return;
    }

    try {
      setErrorMessage(null);
      const days = expiresInDays.trim() ? parseInt(expiresInDays, 10) : undefined;
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        expiresInDays: days && !isNaN(days) ? days : undefined,
      });

      if (result.rawKey) {
        onSuccess(result.rawKey, result.name);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create API key');
      }
    }
  };

  return {
    name,
    setName,
    expiresInDays,
    setExpiresInDays,
    errorMessage,
    isPending: createMutation.isPending,
    handleClose,
    handleSubmit,
  };
}

export function useApiKeys() {
  const { data: keys = [], isLoading, refetch } = useApiKeysService();
  const revokeMutation = useRevokeApiKeyService();
  const deleteMutation = useDeleteApiKeyService();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ rawKey: string; name: string } | null>(null);

  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyItem | null>(null);

  const filteredKeys = useMemo(() => {
    if (!searchTerm.trim()) return keys;
    const term = searchTerm.toLowerCase();
    return keys.filter(
      (k) =>
        k.name.toLowerCase().includes(term) ||
        k.keyPrefix.toLowerCase().includes(term),
    );
  }, [keys, searchTerm]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleKeyCreated = (rawKey: string, keyName: string) => {
    setIsCreateModalOpen(false);
    setNewlyCreatedKey({ rawKey, name: keyName });
  };

  const handleCloseTokenDisplay = () => {
    setNewlyCreatedKey(null);
  };

  const handleRequestRevoke = (key: ApiKeyItem) => {
    setKeyToRevoke(key);
  };

  const handleCancelRevoke = () => {
    setKeyToRevoke(null);
  };

  const handleConfirmRevoke = async () => {
    if (keyToRevoke) {
      await revokeMutation.mutateAsync(keyToRevoke.uuid);
      setKeyToRevoke(null);
    }
  };

  const handleRequestDelete = (key: ApiKeyItem) => {
    setKeyToDelete(key);
  };

  const handleCancelDelete = () => {
    setKeyToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (keyToDelete) {
      await deleteMutation.mutateAsync(keyToDelete.uuid);
      setKeyToDelete(null);
    }
  };

  return {
    keys: filteredKeys,
    totalCount: keys.length,
    isLoading,
    searchTerm,
    setSearchTerm,
    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    newlyCreatedKey,
    handleKeyCreated,
    handleCloseTokenDisplay,
    keyToRevoke,
    handleRequestRevoke,
    handleCancelRevoke,
    handleConfirmRevoke,
    isRevoking: revokeMutation.isPending,
    keyToDelete,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
}
