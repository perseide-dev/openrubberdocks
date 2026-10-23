import type { DocumentDraft, DocumentTab } from '@features-workspaces/files/types/file.types';

const DRAFT_PREFIX = 'openrubberdocks_draft';
const AUTOSAVE_PREF_KEY = 'openrubberdocks_autosave_enabled';
const TABS_PREFIX = 'openrubberdocks_tabs';

export function getDraftKey(workspaceUuid: string, fileUuid: string = 'new'): string {
    return `${DRAFT_PREFIX}_${workspaceUuid}_${fileUuid}`;
}

export function saveDraft(workspaceUuid: string, fileUuid: string = 'new', draft: DocumentDraft): void {
    try {
        const key = getDraftKey(workspaceUuid, fileUuid);
        localStorage.setItem(key, JSON.stringify(draft));
    } catch {
        // Storage quota or privacy mode error handled gracefully
    }
}

export function loadDraft(workspaceUuid: string, fileUuid: string = 'new'): DocumentDraft | null {
    try {
        const key = getDraftKey(workspaceUuid, fileUuid);
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        return JSON.parse(stored) as DocumentDraft;
    } catch {
        return null;
    }
}

export function clearDraft(workspaceUuid: string, fileUuid: string = 'new'): void {
    try {
        const key = getDraftKey(workspaceUuid, fileUuid);
        localStorage.removeItem(key);
    } catch {
        // Ignored
    }
}

export function getAutosavePreference(): boolean {
    try {
        const stored = localStorage.getItem(AUTOSAVE_PREF_KEY);
        if (stored === null) return true; // Default enabled
        return stored === 'true';
    } catch {
        return true;
    }
}

export function setAutosavePreference(enabled: boolean): void {
    try {
        localStorage.setItem(AUTOSAVE_PREF_KEY, String(enabled));
    } catch {
        // Ignored
    }
}

export function getStoredTabs(workspaceUuid: string): DocumentTab[] {
    try {
        const key = `${TABS_PREFIX}_${workspaceUuid}`;
        const stored = sessionStorage.getItem(key);
        if (!stored) return [];
        return JSON.parse(stored) as DocumentTab[];
    } catch {
        return [];
    }
}

export function setStoredTabs(workspaceUuid: string, tabs: DocumentTab[]): void {
    try {
        const key = `${TABS_PREFIX}_${workspaceUuid}`;
        sessionStorage.setItem(key, JSON.stringify(tabs));
    } catch {
        // Ignored
    }
}
