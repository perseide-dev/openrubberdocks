import { useState, useCallback, useEffect } from 'react';
import {
  useSearchUsersService,
  useAddWorkspaceMemberService,
} from '@features-workspaces/members/services/member.service';
import type {
  RoleItem,
  UserSearchResult,
} from '@features-workspaces/members/types/member.types';

export function useAddMemberModal(
  workspaceUuid: string,
  availableRoles: RoleItem[],
  onSuccess: () => void,
) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedRoleUuid, setSelectedRoleUuid] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchUsersService(debouncedSearch);

  const addMemberMutation = useAddWorkspaceMemberService(workspaceUuid);

  const defaultRoleUuid = availableRoles[0]?.uuid || '';
  const currentRoleUuid = selectedRoleUuid || defaultRoleUuid;

  const reset = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedUser(null);
    setSelectedRoleUuid('');
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedUser) {
      setErrorMessage('Please select a platform user to invite');
      return;
    }
    const roleToAssign = selectedRoleUuid || defaultRoleUuid;
    if (!roleToAssign) {
      setErrorMessage('Please assign a workspace role');
      return;
    }
    setErrorMessage(null);
    try {
      await addMemberMutation.mutateAsync({
        userUuid: selectedUser.uuid,
        roleUuid: roleToAssign,
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to add workspace member';
      setErrorMessage(message);
    }
  }, [selectedUser, selectedRoleUuid, defaultRoleUuid, addMemberMutation, reset, onSuccess]);

  return {
    searchInput,
    setSearchInput,
    searchResults,
    isSearching,
    selectedUser,
    setSelectedUser,
    selectedRoleUuid: currentRoleUuid,
    setSelectedRoleUuid,
    errorMessage,
    setErrorMessage,
    isSubmitting: addMemberMutation.isPending,
    handleSubmit,
    reset,
  };
}
