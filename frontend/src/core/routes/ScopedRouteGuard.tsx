import React from 'react';
import { Navigate, useParams, Outlet } from 'react-router-dom';
import { usePermissions } from '@global-hooks/usePermissions';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { ScopedRouteGuardProps } from '@features/auth/types/auth.types';

/**
 * Route protection guard that evaluates contextual Scoped RBAC permissions.
 * Checks if the current user has permission (default: workspace:read)
 * in the active workspace identified by route params (:workspaceUuid or :uuid).
 */
export const ScopedRouteGuard: React.FC<ScopedRouteGuardProps> = ({
  requiredPermission = BASE_PERMISSIONS_ACTIONS.WORKSPACE_READ,
  scopeParamName,
  redirectTo = '/workspaces',
  children,
}) => {
  const params = useParams<Record<string, string>>();
  const { hasPermission } = usePermissions();

  const workspaceUuid = scopeParamName
    ? params[scopeParamName]
    : params.workspaceUuid || params.uuid;

  const isAuthorized = hasPermission(requiredPermission, workspaceUuid);

  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
};
