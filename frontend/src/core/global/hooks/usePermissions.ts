import { useCallback } from 'react';
import { useAuth } from '@global-hooks/useAuth';
import { MUTATION_ACTION_VERBS } from '@utils-constants/permissions.constants';
import type { UsePermissionsReturn } from '@features/auth/types/auth.types';

/**
 * Reactively evaluates the Scoped RBAC permissions for the current user
 * according to backend AccessControlService rules:
 * 1. coreAdmin: Universal scope bypass, has all permissions unconditionally.
 * 2. external: Strictly scoped to assigned workspace, mutation lock enforced.
 * 3. internal (global): Unscoped assignments (workspace = null) apply platform-wide.
 * 4. internal (scoped): Evaluated in the context of the provided workspaceUuid.
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();

  const isCoreAdmin = user?.type === 'coreAdmin';
  const isExternal = user?.type === 'external';
  const isInternal = user?.type === 'internal';

  const hasPermission = useCallback(
    (action: string, workspaceUuid?: string): boolean => {
      if (!user) {
        return false;
      }

      // Rule 1: coreAdmin has universal access
      if (user.type === 'coreAdmin') {
        return true;
      }

      if (!user.scopes || user.scopes.length === 0) {
        return false;
      }

      for (const scope of user.scopes) {
        const hasAction = scope.role?.permissions?.some((p) => p.action === action);

        if (hasAction) {
          // Rule 2: External users cannot mutate data under any circumstance
          if (user.type === 'external') {
            const isMutation = MUTATION_ACTION_VERBS.some((verb) => action.includes(verb));
            if (isMutation) {
              continue;
            }

            // External user rules
            if (action.startsWith('document:') && user.canViewDocuments === false) {
              continue;
            }
            if ((action.startsWith('project:') || action.startsWith('task:')) && user.canViewProjects === false) {
              continue;
            }

            if (workspaceUuid && scope.workspace?.uuid === workspaceUuid) {
              return true;
            }
            continue;
          }

          // Rule 3: Internal user with global scope (workspace is null or undefined)
          if (!scope.workspace) {
            return true;
          }

          // Rule 4: Internal user with specific workspace scope
          if (workspaceUuid && scope.workspace?.uuid === workspaceUuid) {
            return true;
          }
        }
      }

      return false;
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (actions: string[], workspaceUuid?: string): boolean => {
      return actions.some((action) => hasPermission(action, workspaceUuid));
    },
    [hasPermission]
  );

  const canMutateInWorkspace = useCallback(
    (workspaceUuid?: string): boolean => {
      if (!user) {
        return false;
      }
      if (user.type === 'coreAdmin') {
        return true;
      }
      if (user.type === 'external') {
        return false;
      }
      return hasPermission('workspace:write', workspaceUuid);
    },
    [user, hasPermission]
  );

  return {
    hasPermission,
    hasAnyPermission,
    canMutateInWorkspace,
    isCoreAdmin,
    isExternal,
    isInternal,
    canViewDocuments: user?.canViewDocuments !== false,
    canViewProjects: user?.canViewProjects !== false,
    userType: user?.type,
  };
}
