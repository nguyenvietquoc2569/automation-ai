import { ReactNode } from 'react';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  key?: string;
  title?: string;
  href?: string;
  icon?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Dashboard layout props interface
 */
export interface DashboardLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  title?: string;
  showSidebar?: boolean;
  showUserProfile?: boolean;
}

/**
 * User menu item interface
 */
export interface UserMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: NavigationItem[];
}
