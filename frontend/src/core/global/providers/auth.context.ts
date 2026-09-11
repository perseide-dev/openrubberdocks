import { createContext } from 'react';
import type { AuthContextValue } from '@features/auth/types/auth.types';

export const AuthContext = createContext<AuthContextValue | null>(null);
