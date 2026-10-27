import { useState, useMemo, useCallback } from 'react';
import {
  useAdminUsersService,
  useAdminRolesService,
} from '@features/admin/users/services/user-admin.service';
import type { AdminUserItem } from '@features/admin/users/types/user-admin.types';

export function useUserAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserItem | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useAdminUsersService();
  const { data: availableRoles = [] } = useAdminRolesService();

  const handleOpenEditModal = useCallback((user: AdminUserItem) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        u.rubberHandle.toLowerCase().includes(term) ||
        u.type.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  return {
    users: filteredUsers,
    totalCount: users.length,
    availableRoles,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    userToEdit,
    handleOpenEditModal,
    handleCloseEditModal,
    refetch,
  };
}
