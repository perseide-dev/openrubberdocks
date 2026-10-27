import { useState, useCallback } from 'react';
import {
  useCreateAdminRoleService,
  useUpdateAdminRoleService,
} from '@features/admin/roles/services/role-admin.service';
import type { AdminRoleItem } from '@features/admin/roles/types/role-admin.types';

export function useRoleModal(
  roleToEdit: AdminRoleItem | null,
  open: boolean,
  onSuccess: () => void,
) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissionUuids, setSelectedPermissionUuids] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateAdminRoleService();
  const updateMutation = useUpdateAdminRoleService();

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevRoleToEdit, setPrevRoleToEdit] = useState<AdminRoleItem | null>(roleToEdit);

  if (open !== prevOpen || roleToEdit !== prevRoleToEdit) {
    setPrevOpen(open);
    setPrevRoleToEdit(roleToEdit);
    if (open) {
      setName(roleToEdit?.name || '');
      setDescription(roleToEdit?.description || '');
      setSelectedPermissionUuids(roleToEdit?.permissions?.map((p) => p.uuid) || []);
      setErrorMessage(null);
    }
  }

  const togglePermission = useCallback((uuid: string) => {
    setSelectedPermissionUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  }, []);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setSelectedPermissionUuids([]);
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setErrorMessage('Role name must be at least 3 characters');
      return;
    }
    if (selectedPermissionUuids.length === 0) {
      setErrorMessage('Select at least one permission for this role');
      return;
    }

    setErrorMessage(null);
    try {
      if (roleToEdit) {
        await updateMutation.mutateAsync({
          uuid: roleToEdit.uuid,
          payload: {
            name: trimmedName,
            description: description.trim() || undefined,
            permissionUuids: selectedPermissionUuids,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          description: description.trim() || undefined,
          permissionUuids: selectedPermissionUuids,
        });
      }
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save role';
      setErrorMessage(message);
    }
  }, [name, description, selectedPermissionUuids, roleToEdit, createMutation, updateMutation, reset, onSuccess]);

  return {
    name,
    setName,
    description,
    setDescription,
    selectedPermissionUuids,
    togglePermission,
    errorMessage,
    setErrorMessage,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    handleSubmit,
    reset,
  };
}
