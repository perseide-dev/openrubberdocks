import { useState, useMemo, useCallback } from 'react';
import {
  useAdminRolesService,
  useAdminPermissionsService,
  useDeleteAdminRoleService,
} from '@features/admin/roles/services/role-admin.service';
import type { AdminRoleItem } from '@features/admin/roles/types/role-admin.types';

export function useRoleAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<AdminRoleItem | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<AdminRoleItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: roles = [], isLoading, isError, refetch } = useAdminRolesService();
  const { data: availablePermissions = [] } = useAdminPermissionsService();
  const deleteMutation = useDeleteAdminRoleService();

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const term = searchTerm.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)),
    );
  }, [roles, searchTerm]);

  const handleOpenCreate = useCallback(() => {
    setRoleToEdit(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((role: AdminRoleItem) => {
    setRoleToEdit(role);
    setIsFormModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!roleToDelete) return;
    setErrorMessage(null);
    try {
      await deleteMutation.mutateAsync(roleToDelete.uuid);
      setRoleToDelete(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete role';
      setErrorMessage(message);
    }
  }, [roleToDelete, deleteMutation]);

  return {
    roles: filteredRoles,
    totalCount: roles.length,
    availablePermissions,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    isFormModalOpen,
    setIsFormModalOpen,
    roleToEdit,
    roleToDelete,
    setRoleToDelete,
    errorMessage,
    setErrorMessage,
    handleOpenCreate,
    handleOpenEdit,
    handleConfirmDelete,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
}
