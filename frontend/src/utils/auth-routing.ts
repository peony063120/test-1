import type { AuthUser } from '@/types/auth.types';
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_SALES, ROLE_WAREHOUSE, hasRole } from '@/constants/rbac';

export const getDefaultRouteForUser = (user: AuthUser | null | undefined): string => {
  if (!user) return '/dashboard';
  if (hasRole(user, ROLE_ADMIN)) return '/admin';
  if (hasRole(user, ROLE_WAREHOUSE)) return '/warehouse';
  if (hasRole(user, ROLE_SALES)) return '/sales/pos';
  if (hasRole(user, ROLE_MANAGER)) return '/manager';
  return '/dashboard';
};
