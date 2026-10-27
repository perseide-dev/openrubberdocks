import type { ElementType } from 'react';
import type { RouteObject } from 'react-router-dom';

export interface NavHandle {
  label: string;
  icon?: ElementType;
}

export interface ProtectedLayoutProps {
  navRoutes: RouteObject[];
}
