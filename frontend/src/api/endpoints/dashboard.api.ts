import api from '@/api/axios.config';

export interface DashboardStats { products: number; orders: number; inventory: number; revenue: number; profit?: number; lowStock?: number; }
export interface RevenuePoint { label: string; revenue: number; }
interface DashboardCharts { trend?: Array<{ label?: string; date?: string; revenue?: number; value?: number }>; sales?: Array<{ label?: string; date?: string; revenue?: number; value?: number }>; }
export interface DashboardActivity { id: string; title: string; description?: string; createdAt: string; type?: string; }
export interface LowStockItem { id: string; quantity: number; minimumQuantity: number; product?: { name: string; sku?: string }; }

export const dashboardApi = {
  getStats: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
  // Backend currently exposes chart data at /dashboard/charts, not /dashboard/revenue.
  getRevenue: async (_period = 'week'): Promise<RevenuePoint[]> => {
    const { data } = await api.get<DashboardCharts>('/dashboard/charts');
    return (data.trend || data.sales || []).map((point) => ({ label: point.label || point.date || '', revenue: Number(point.revenue ?? point.value ?? 0) }));
  },
  // No dashboard activities endpoint is present in the backend yet.
  // Return an empty list so the dashboard remains functional instead of issuing a 404.
  getActivities: async (): Promise<DashboardActivity[]> => [],
  getLowStock: async () => (await api.get<LowStockItem[]>('/dashboard/low-stock')).data,
};
