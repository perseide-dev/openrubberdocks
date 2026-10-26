import type { ReactNode } from 'react';

export interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}
