import type { ChangeEvent } from 'react';
import type { BlockType, BlockEditorController, WorkspaceBlock, FileEditorBlock } from '@features-workspaces/files/types/block.types';

export interface DocumentDraft {
    title: string;
    icon: string | null;
    coverImage: string | null;
    isTemplate: boolean;
    blocks: FileEditorBlock[];
    updatedAt: number;
}

export type AutosaveStatus = 'saved' | 'saving' | 'unsaved';

export interface DocumentTab {
    uuid: string;
    title: string;
    icon: string | null;
    isNew?: boolean;
    isDirty?: boolean;
    mode?: 'view' | 'edit';
}

export interface DocumentTabsBarProps {
    workspaceUuid?: string;
    tabs: DocumentTab[];
    activeTabUuid: string;
    onSelectTab: (tab: DocumentTab) => void;
    onCloseTab: (tabUuid: string) => void;
    onNewTab: () => void;
}

export interface WorkspaceFile {
    id: string;
    uuid: string;
    workspaceUuid: string;
    parentPageUuid: string | null;
    parentPage?: WorkspaceFile;
    childPages?: WorkspaceFile[];
    title: string;
    icon: string | null;
    coverImage: string | null;
    isTemplate: boolean;
    createdByUuid: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFilePayload extends Record<string, unknown> {
    workspaceUuid: string;
    parentPageUuid?: string;
    title: string;
    icon?: string;
    coverImage?: string;
    isTemplate?: boolean;
}

export interface UpdateFilePayload extends Record<string, unknown> {
    parentPageUuid?: string | null;
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    isTemplate?: boolean;
}

export interface UpdateFileVariables {
    uuid: string;
    payload: UpdateFilePayload;
}

export interface FileFilters {
    workspaceUuid?: string;
    parentPageUuid?: string;
    isTemplate?: boolean;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
}

export type FilesViewMode = 'table' | 'cards';

export interface FilesCardsProps {
    files: WorkspaceFile[];
    onDelete?: (file: WorkspaceFile) => void;
}

export interface FilesTableProps {
    files: WorkspaceFile[];
    onDelete?: (file: WorkspaceFile) => void;
}

export interface FilesViewProps {
    files: WorkspaceFile[];
    viewMode: FilesViewMode;
    onViewModeChange: (mode: FilesViewMode) => void;
    onDeleteFile?: (file: WorkspaceFile) => void;
}

export interface PageTreeNode {
    file: WorkspaceFile;
    children: PageTreeNode[];
    level: number;
}

export interface PageTreeItemProps {
    node: PageTreeNode;
    activeFileUuid?: string;
    workspaceUuid: string;
    onSelectPage: (fileUuid: string) => void;
    onCreateSubPage?: (parentPageUuid: string) => void;
}

export interface PageTreeSidebarProps {
    workspaceUuid: string;
    activeFileUuid?: string;
    onCloseMobile?: () => void;
}

export interface CoverPreset {
    id: string;
    label: string;
    url: string;
    previewColor: string;
}

export interface IconPreset {
    id: string;
    label: string;
    icon: string;
}

export interface TemplateBlockDefinition {
    type: BlockType;
    content: string;
    checked?: boolean;
}

export interface BuiltInTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    coverImage: string;
    blocks: TemplateBlockDefinition[];
}

export interface FileEditorProps {
    title: string;
    errorMessage: string | null;
    blockEditor: BlockEditorController;
    icon?: string | null;
    coverImage?: string | null;
    isTemplate?: boolean;
    workspaceTemplates?: WorkspaceFile[];
    onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onIconChange?: (icon: string | null) => void;
    onCoverChange?: (cover: string | null) => void;
    onToggleTemplate?: (isTemplate: boolean) => void;
    onApplyTemplate?: (template: BuiltInTemplate | WorkspaceFile) => void;
}

export interface FileViewerProps {
    blocks: WorkspaceBlock[];
    title?: string;
    icon?: string | null;
    coverImage?: string | null;
    isTemplate?: boolean;
}

export interface IconPickerPopoverProps {
    anchorEl: HTMLElement | null;
    currentIcon?: string | null;
    onClose: () => void;
    onSelectIcon: (icon: string | null) => void;
}

export interface CoverPickerPopoverProps {
    anchorEl: HTMLElement | null;
    currentCover?: string | null;
    onClose: () => void;
    onSelectCover: (coverUrl: string | null) => void;
}

export interface TemplateSelectorModalProps {
    open: boolean;
    workspaceTemplates: WorkspaceFile[];
    onClose: () => void;
    onSelectTemplate: (template: BuiltInTemplate | WorkspaceFile) => void;
}

export interface FileEditContentProps {
    wsUuid: string;
    fUuid: string;
    workspaceName?: string;
}

export interface FileCreationContentProps {
    workspaceUuid: string;
    draftId: string;
    workspaceName?: string;
    onDraftInfoChange?: (info: { title: string; icon: string | null }) => void;
}

export type { BreadcrumbItem, BrutalistBreadcrumbsProps } from '@components/ui';
