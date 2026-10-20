import { useState, useCallback } from 'react';
import { useCreateAdminUserService } from '@features/admin/users/services/user-admin.service';
import type { AdminUserType } from '@features/admin/users/types/user-admin.types';

export function useCreateUserModal(onSuccess: () => void) {
  const [username, setUsername] = useState('');
  const [rubberHandle, setRubberHandle] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<AdminUserType>('internal');
  const [initialRoleUuid, setInitialRoleUuid] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateAdminUserService();

  const reset = useCallback(() => {
    setUsername('');
    setRubberHandle('');
    setPassword('');
    setType('internal');
    setInitialRoleUuid('');
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
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
    if (cleanPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    setErrorMessage(null);
    try {
      await createMutation.mutateAsync({
        username: trimmedUsername,
        rubberHandle: cleanHandle,
        password: cleanPassword,
        type,
        initialRoleUuid: initialRoleUuid || undefined,
      });
      reset();
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create platform user';
      setErrorMessage(message);
    }
  }, [username, rubberHandle, password, type, initialRoleUuid, createMutation, reset, onSuccess]);

  return {
    username,
    setUsername,
    rubberHandle,
    setRubberHandle,
    password,
    setPassword,
    type,
    setType,
    initialRoleUuid,
    setInitialRoleUuid,
    errorMessage,
    setErrorMessage,
    isSubmitting: createMutation.isPending,
    handleSubmit,
    reset,
  };
}
