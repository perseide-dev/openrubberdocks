import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkspaceMembersRepository,
  addWorkspaceMemberRepository,
  updateMemberRoleRepository,
  removeWorkspaceMemberRepository,
  getAvailableRolesRepository,
  searchUsersRepository,
} from '@features-workspaces/members/repositories/member.repository';
import { MEMBER_QUERY_KEYS } from '@features-workspaces/members/constants/member.constants';
import type {
  AddMemberPayload,
  UpdateMemberRolePayload,
} from '@features-workspaces/members/types/member.types';

export function useWorkspaceMembersService(workspaceUuid: string) {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.MEMBERS(workspaceUuid),
    queryFn: () => getWorkspaceMembersRepository(workspaceUuid),
    enabled: Boolean(workspaceUuid),
  });
}

export function useAddWorkspaceMemberService(workspaceUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) =>
      addWorkspaceMemberRepository(workspaceUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.MEMBERS(workspaceUuid),
      });
    },
  });
}

export function useUpdateMemberRoleService(workspaceUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userUuid,
      payload,
    }: {
      userUuid: string;
      payload: UpdateMemberRolePayload;
    }) => updateMemberRoleRepository(workspaceUuid, userUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.MEMBERS(workspaceUuid),
      });
    },
  });
}

export function useRemoveWorkspaceMemberService(workspaceUuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userUuid: string) =>
      removeWorkspaceMemberRepository(workspaceUuid, userUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_QUERY_KEYS.MEMBERS(workspaceUuid),
      });
    },
  });
}

export function useAvailableRolesService() {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.ROLES,
    queryFn: getAvailableRolesRepository,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearchUsersService(query: string) {
  return useQuery({
    queryKey: MEMBER_QUERY_KEYS.USERS(query),
    queryFn: () => searchUsersRepository(query),
    enabled: query.trim().length >= 1,
  });
}
