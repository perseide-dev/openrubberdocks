import { useState, useCallback, useEffect } from 'react';
import { useUpdateAdminUserService } from '@features/admin/users/services/user-admin.service';
import type {
  AdminUserItem,
  AdminUserType,
} from '@features/admin/users/types/user-admin.types';

export function useEditUserModal(
  user: AdminUserItem | null,
  open: boolean,
  onSuccess: () => void,
) {
  const [username, setUsername] = useState('');
  const [rubberHandle, setRubberHandle] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<AdminUserType>('internal');
  const [globalRoleUuid, setGlobalRoleUuid] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateAdminUserService();

  const isCoreAdmin = user?.type === 'coreAdmin';

  useEffect(() => {
    if (open && user) {
      setUsername(user.username || '');
      setRubberHandle(user.rubberHandle || '');
      setPassword('');
      setType(user.type || 'internal');
      const existingGlobalRole = user.scopes?.find((s) => !s.workspace)?.role.uuid || '';
      setGlobalRoleUuid(existingGlobalRole);
      setErrorMessage(null);
    }
  }, [open, user]);

  const reset = useCallback(() => {
    setUsername('');
    setRubberHandle('');
    setPassword('');
    setType('internal');
    setGlobalRoleUuid('');
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user) return;

    const trimmedUsername = username.trim();
    const cleanHandle = rubberHandle.trim().replace(/^@/, '').toLowerCase();
    const cleanPassword = password.trim();

    if (trimmedUsername.length < 3) {
      setErrorMessage('Full name must be at least 3 characters');
      return;
    }
    if (cleanHandle.length < 3) {
      setErrorMessage('Rubber handle must be at least 3 characters');
      return;
    }
    if (cleanPassword.length > 0 && cleanPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters if provided');
      return;
    }

    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({
        uuid: user.uuid,
        payload: {
          username: trimmedUsername,
          rubberHandle: cleanHandle,
          password: cleanPassword || undefined,
          type: isCoreAdmin ? undefined : type,
          globalRoleUuid: isCoreAdmin ? undefined : (type === 'external' ? null : (globalRoleUuid || null)),
        },
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update platform user';
      setErrorMessage(message);
    }
  }, [user, username, rubberHandle, password, type, globalRoleUuid, isCoreAdmin, updateMutation, reset, onSuccess]);

  return {
    username,
    setUsername,
    rubberHandle,
    setRubberHandle,
    password,
    setPassword,
    type,
    setType,
    globalRoleUuid,
    setGlobalRoleUuid,
    isCoreAdmin,
    errorMessage,
    setErrorMessage,
    isSubmitting: updateMutation.isPending,
    handleSubmit,
    reset,
  };
}
