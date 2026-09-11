import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@global-hooks/useAuth';
import {
  LOGIN_FORM_INITIAL_STATE,
  AUTH_MESSAGES,
} from '@features/auth/constants/auth.constants';
import type { LoginFormState } from '@features/auth/types/auth.types';
import type { AppError } from '@http-error/http-error.handler';

export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formState, setFormState] = useState<LoginFormState>(LOGIN_FORM_INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHandleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev) => ({ ...prev, rubberHandle: value }));
    setErrorMessage(null);
  }, []);

  const handlePwdChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState((prev) => ({ ...prev, pwd: value }));
    setErrorMessage(null);
  }, []);

  const handleTogglePassword = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const trimmedHandle = formState.rubberHandle.trim();
      const pwd = formState.pwd;

      if (!trimmedHandle || !pwd) {
        setErrorMessage(AUTH_MESSAGES.UNAUTHORIZED);
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        await login({
          rubberHandle: trimmedHandle,
          pwd,
        });

        // Determine destination: redirect to origin route if protected or default to /dashboard
        const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname;
        const destination = fromLocation && fromLocation !== '/login' ? fromLocation : '/dashboard';
        navigate(destination, { replace: true });
      } catch (err) {
        const appError = err as AppError;
        const errorDetail =
          appError?.errors?.[0]?.detail ||
          appError?.errors?.[0]?.title ||
          appError?.message ||
          AUTH_MESSAGES.DEFAULT_ERROR;

        setErrorMessage(errorDetail);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState.rubberHandle, formState.pwd, login, location.state, navigate]
  );

  return {
    formState,
    errorMessage,
    isSubmitting,
    handleHandleChange,
    handlePwdChange,
    handleTogglePassword,
    handleSubmit,
  };
}
