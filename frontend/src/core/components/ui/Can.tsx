import React from 'react';
import { usePermissions } from '@global-hooks/usePermissions';
import type { CanProps } from '@features/auth/types/auth.types';

/**
 * Declarative UI component for RBAC authorization.
 * Evaluates the required permission in the given scope using usePermissions.
 * Renders fallback (default null) if unauthorized.
 */
export const Can: React.FC<CanProps> = ({ action, scope, children, fallback = null }) => {
  const { hasPermission } = usePermissions();

  const isAllowed = hasPermission(action, scope);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
