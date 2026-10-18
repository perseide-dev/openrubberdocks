export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BrutalistBreadcrumbsProps {
  items: BreadcrumbItem[];
}
