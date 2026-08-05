import api from '@/api/axios.config';
export const reportApi = { inventory: async (params: Record<string, unknown>) => (await api.get('/reports/inventory', { params })).data, sales: async (params: Record<string, unknown>) => (await api.get('/reports/sales', { params })).data, purchase: async (params: Record<string, unknown>) => (await api.get('/reports/purchase', { params })).data };
