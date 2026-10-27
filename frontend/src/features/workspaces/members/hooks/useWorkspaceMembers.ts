import { useState, useMemo, useCallback } from 'react';
import {
  useWorkspaceMembersService,
  useAvailableRolesService,
  useUpdateMemberRoleService,
  useRemoveWorkspaceMemberService,
} from '@features-workspaces/members/services/member.service';
import type { WorkspaceMemberItem } from '@features-workspaces/members/types/member.types';

export function useWorkspaceMembers(workspaceUuid: string) {
  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
  } = useWorkspaceMembersService(workspaceUuid);

  const { data: availableRoles = [] } = useAvailableRolesService();
  const updateRoleMutation = useUpdateMemberRoleService(workspaceUuid);
  const removeMemberMutation = useRemoveWorkspaceMemberService(workspaceUuid);

  const [searchTerm, setSearchTerm] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase().trim();
    const cleanTerm = term.replace(/^@/, '');
    return members.filter((m) => {
      const username = m.username?.toLowerCase() || '';
      const handle = m.rubberHandle?.toLowerCase() || '';
      const roleName = m.role?.name?.toLowerCase() || '';

      return (
        username.includes(term) ||
        username.includes(cleanTerm) ||
        handle.includes(cleanTerm) ||
        roleName.includes(term) ||
        roleName.includes(cleanTerm)
      );
    });
  }, [members, searchTerm]);

  const handleUpdateRole = useCallback(
    async (userUuid: string, roleUuid: string) => {
      setErrorMessage(null);
      try {
        await updateRoleMutation.mutateAsync({
          userUuid,
          payload: { roleUuid },
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update member role';
        setErrorMessage(message);
      }
    },
    [updateRoleMutation],
  );

  const handleConfirmRemove = useCallback(async () => {
    if (!memberToRemove) return;
    setErrorMessage(null);
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.userUuid);
      setMemberToRemove(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove member';
      setErrorMessage(message);
    }
  }, [memberToRemove, removeMemberMutation]);

  return {
    members: filteredMembers,
    totalCount: members.length,
    availableRoles,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    memberToRemove,
    setMemberToRemove,
    isAddModalOpen,
    setIsAddModalOpen,
    errorMessage,
    setErrorMessage,
    handleUpdateRole,
    handleConfirmRemove,
    isUpdatingRole: updateRoleMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    refetch,
  };
}
