import { useState, useMemo } from 'react';
import {
  useApiKeysService,
  useRevokeApiKeyService,
  useDeleteApiKeyService,
} from '@features/admin/api-keys/services/api-keys.service';
import type { ApiKeyItem } from '@features/admin/api-keys/types/api-keys.types';

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
