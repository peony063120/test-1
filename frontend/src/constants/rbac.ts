import type { AuthUser } from '@/types/auth.types';

export const ROLE_ADMIN = 'ADMIN';
export const ROLE_MANAGER = 'MANAGER';
export const ROLE_WAREHOUSE = 'WAREHOUSE_STAFF';
export const ROLE_SALES = 'SALES_STAFF';

export type AppRole =
  | typeof ROLE_ADMIN
  | typeof ROLE_MANAGER
  | typeof ROLE_WAREHOUSE
  | typeof ROLE_SALES;

export const getUserRoleNames = (user: AuthUser | null | undefined): string[] =>
  user?.roles?.map((role) => role.name) || [];

export const hasRole = (user: AuthUser | null | undefined, role: AppRole): boolean =>
  getUserRoleNames(user).includes(role);

export const hasAnyRole = (user: AuthUser | null | undefined, roles: AppRole[]): boolean =>
  roles.some((role) => hasRole(user, role));

export const can = (user: AuthUser | null | undefined, permission: string): boolean =>
  user?.permissions?.includes(permission) ?? false;
