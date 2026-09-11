import { useContext } from 'react';
import { AuthContext } from '@global-providers/auth.context';
import type { AuthContextValue } from '@features/auth/types/auth.types';

/**
 * Global hook to access authentication state and session methods.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }

  return context;
}
