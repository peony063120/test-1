import api from '@/api/axios.config';
import type { PaginatedResponse } from '@/types/common.types';
import type { OrderLine } from './purchase-order.api';
export interface SalesOrder { id: string; code?: string; status: string; customerId: string; warehouseId: string; totalAmount?: number; orderDate?: string; items?: OrderLine[]; customer?: { name: string }; }
export interface SalesOrderPayload { customerId: string; warehouseId: string; items: OrderLine[]; note?: string; }
export const salesOrderApi = { list: async (params: Record<string, unknown> = {}) => (await api.get<PaginatedResponse<SalesOrder> | SalesOrder[]>('/sales-orders', { params })).data, get: async (id: string) => (await api.get<SalesOrder>(`/sales-orders/${id}`)).data, create: async (payload: SalesOrderPayload) => (await api.post<SalesOrder>('/sales-orders', payload)).data, update: async (id: string, payload: Partial<SalesOrderPayload>) => (await api.put<SalesOrder>(`/sales-orders/${id}`, payload)).data, ship: async (id: string, note?: string) => (await api.post<SalesOrder>(`/sales-orders/${id}/ship`, { note })).data, remove: async (id: string) => { await api.delete(`/sales-orders/${id}`); } };
