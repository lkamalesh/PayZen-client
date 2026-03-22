import type { UserRole } from '@/types/auth';

export interface RoleNavItem {
  label: string;
  path: string;
}

const ROLE_NAV_ITEMS: Record<UserRole, RoleNavItem[]> = {
  Merchant: [{ label: 'Dashboard', path: '/' }],
  Analyst: [
    { label: 'Dashboard', path: '/' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Risk Rules', path: '/rules' },
    { label: 'Audit Logs', path: '/audit' },
    { label: 'Merchants', path: '/merchants' },
  ],
  Unknown: [{ label: 'Dashboard', path: '/' }],
};

const ROLE_DEFAULT_PATH: Record<UserRole, string> = {
  Merchant: '/',
  Analyst: '/',
  Unknown: '/',
};

export const getNavItemsForRole = (role: UserRole): RoleNavItem[] => ROLE_NAV_ITEMS[role] ?? ROLE_NAV_ITEMS.Unknown;

export const getDefaultPathForRole = (role: UserRole): string => ROLE_DEFAULT_PATH[role] ?? '/';

export const canAccessPath = (role: UserRole, path: string): boolean => {
  const navItems = getNavItemsForRole(role);
  return navItems.some((item) => item.path === path);
};
