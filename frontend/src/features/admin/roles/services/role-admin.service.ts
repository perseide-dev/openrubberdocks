import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminRolesRepository,
  getAdminPermissionsRepository,
  createAdminRoleRepository,
  updateAdminRoleRepository,
  deleteAdminRoleRepository,
} from '@features/admin/roles/repositories/role-admin.repository';
import { ROLE_ADMIN_QUERY_KEYS } from '@features/admin/roles/constants/role-admin.constants';
import type {
  CreateRolePayload,
  UpdateRolePayload,
} from '@features/admin/roles/types/role-admin.types';

export function useAdminRolesService() {
  return useQuery({
    queryKey: ROLE_ADMIN_QUERY_KEYS.ROLES,
    queryFn: getAdminRolesRepository,
  });
}

export function useAdminPermissionsService() {
  return useQuery({
    queryKey: ROLE_ADMIN_QUERY_KEYS.PERMISSIONS,
    queryFn: getAdminPermissionsRepository,
    staleTime: 1000 * 60 * 15,
  });
}

export function useCreateAdminRoleService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createAdminRoleRepository(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROLE_ADMIN_QUERY_KEYS.ROLES,
      });
    },
  });
}

export function useUpdateAdminRoleService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: UpdateRolePayload }) =>
      updateAdminRoleRepository(uuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROLE_ADMIN_QUERY_KEYS.ROLES,
      });
    },
  });
}

export function useDeleteAdminRoleService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => deleteAdminRoleRepository(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ROLE_ADMIN_QUERY_KEYS.ROLES,
      });
    },
  });
}
