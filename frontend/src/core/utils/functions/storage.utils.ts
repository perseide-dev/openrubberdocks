import { DRAFT_PREFIX, TABS_PREFIX } from '@utils-constants/storage.constants';

/**
 * Removes all persisted document drafts from localStorage and open document tabs from sessionStorage.
 * Must be invoked on logout to prevent cross-session data leakage.
 */
export function clearAllDraftsAndTabs(): void {
  try {
    const draftKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${DRAFT_PREFIX}_`)) {
        draftKeys.push(key);
      }
    }
    draftKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage access error handled gracefully
  }

  try {
    const tabKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`${TABS_PREFIX}_`)) {
        tabKeys.push(key);
      }
    }
    tabKeys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Storage access error handled gracefully
  }
}
