import type { HasTreeHierarchy, PageTreeNode } from '@components/ui/types/breadcrumbs.types';

export type { HasTreeHierarchy, PageTreeNode } from '@components/ui/types/breadcrumbs.types';

/**
 * Builds a nested hierarchical tree of items from a flat list.
 */
export function buildPageTree<T extends HasTreeHierarchy>(files: T[]): PageTreeNode<T>[] {
  if (!files || files.length === 0) {
    return [];
  }

  const fileMap = new Map<string, T>();
  const childrenMap = new Map<string, T[]>();

  files.forEach((file) => {
    fileMap.set(file.uuid, file);
    if (file.parentPageUuid) {
      const existing = childrenMap.get(file.parentPageUuid) || [];
      existing.push(file);
      childrenMap.set(file.parentPageUuid, existing);
    }
  });

  const buildSubTree = (file: T, level: number): PageTreeNode<T> => {
    const rawChildren = childrenMap.get(file.uuid) || [];
    const sortedChildren = [...rawChildren].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );

    return {
      file,
      level,
      children: sortedChildren.map((child) => buildSubTree(child, level + 1)),
    };
  };

  // Root items: either parentPageUuid is null/empty or the referenced parent does not exist in the collection
  const rootFiles = files.filter(
    (file) => !file.parentPageUuid || !fileMap.has(file.parentPageUuid)
  );

  const sortedRoots = [...rootFiles].sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  );

  return sortedRoots.map((root) => buildSubTree(root, 0));
}

/**
 * Traverses upwards through parentPageUuid references to build the linear chain
 * of ancestor items leading up to and including the current item.
 */
export function getPageAncestors<T extends { uuid: string; parentPageUuid?: string | null }>(
  fileUuid: string,
  files: T[]
): T[] {
  if (!fileUuid || !files || files.length === 0) {
    return [];
  }

  const fileMap = new Map<string, T>();
  files.forEach((f) => fileMap.set(f.uuid, f));

  const chain: T[] = [];
  const visited = new Set<string>();
  let currentUuid: string | null | undefined = fileUuid;

  while (currentUuid && fileMap.has(currentUuid) && !visited.has(currentUuid)) {
    visited.add(currentUuid);
    const file = fileMap.get(currentUuid);
    if (!file) {
      break;
    }
    chain.unshift(file);
    currentUuid = file.parentPageUuid;
  }

  return chain;
}
