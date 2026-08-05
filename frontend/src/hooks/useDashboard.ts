import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/endpoints/dashboard.api';

export const useDashboardStats = () => useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.getStats });
/** Dashboard chart endpoint currently returns pre-aggregated trend data. */
export const useRevenueData = (period = 'week') => useQuery({ queryKey: ['dashboard', 'charts', period], queryFn: () => dashboardApi.getRevenue(period) });
export const useLowStock = () => useQuery({ queryKey: ['dashboard', 'low-stock'], queryFn: dashboardApi.getLowStock });
export const useRecentActivities = () => useQuery({ queryKey: ['dashboard', 'activities'], queryFn: dashboardApi.getActivities });
