export type PlatformUserType = 'coreAdmin' | 'internal' | 'external';

export interface WorkspaceMemberRole {
  uuid: string;
  name: string;
  description?: string;
}

export interface WorkspaceMemberItem {
  id: string | number;
  userUuid: string;
  username: string;
  rubberHandle: string;
  userType: PlatformUserType;
  joinedAt: string;
  role: WorkspaceMemberRole | null;
}

export interface AddMemberPayload extends Record<string, unknown> {
  userUuid: string;
  roleUuid: string;
}

export interface UpdateMemberRolePayload extends Record<string, unknown> {
  roleUuid: string;
}

export interface RoleItem {
  uuid: string;
  name: string;
  description?: string;
  isSystemDefined?: boolean;
}

export interface UserSearchResult {
  uuid: string;
  username: string;
  rubberHandle: string;
  type: PlatformUserType;
}

export interface MembersTableProps {
  members: WorkspaceMemberItem[];
  availableRoles: RoleItem[];
  canManage: boolean;
  onUpdateRole: (userUuid: string, roleUuid: string) => Promise<void>;
  onRemoveMember: (member: WorkspaceMemberItem) => void;
  isUpdatingRole?: boolean;
}

export interface AddMemberModalProps {
  open: boolean;
  workspaceUuid: string;
  availableRoles: RoleItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export interface MembersTabContentProps {
  workspaceUuid: string;
  canManage: boolean;
}
