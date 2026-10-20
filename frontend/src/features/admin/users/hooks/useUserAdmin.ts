import { useState, useMemo } from 'react';
import {
  useAdminUsersService,
  useAdminRolesService,
} from '@features/admin/users/services/user-admin.service';

export function useUserAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: users = [], isLoading, isError, refetch } = useAdminUsersService();
  const { data: availableRoles = [] } = useAdminRolesService();

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
    refetch,
  };
}
