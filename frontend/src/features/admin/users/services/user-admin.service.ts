import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminUsersRepository,
  createAdminUserRepository,
  getAdminRolesRepository,
} from '@features/admin/users/repositories/user-admin.repository';
import { USER_ADMIN_QUERY_KEYS } from '@features/admin/users/constants/user-admin.constants';
import type { CreateUserPayload } from '@features/admin/users/types/user-admin.types';

export function useAdminUsersService(search?: string) {
  return useQuery({
    queryKey: USER_ADMIN_QUERY_KEYS.USERS(search),
    queryFn: () => getAdminUsersRepository(search),
  });
}

export function useCreateAdminUserService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      createAdminUserRepository(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      });
    },
  });
}

export function useAdminRolesService() {
  return useQuery({
    queryKey: USER_ADMIN_QUERY_KEYS.ROLES,
    queryFn: getAdminRolesRepository,
    staleTime: 1000 * 60 * 10,
  });
}
