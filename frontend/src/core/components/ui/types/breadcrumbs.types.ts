export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BrutalistBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export interface HasTreeHierarchy {
  uuid: string;
  parentPageUuid?: string | null;
  title?: string;
}

export interface PageTreeNode<T extends HasTreeHierarchy = HasTreeHierarchy> {
  file: T;
  children: PageTreeNode<T>[];
  level: number;
}
