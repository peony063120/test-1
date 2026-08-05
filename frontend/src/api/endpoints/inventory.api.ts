import api from '@/api/axios.config';
import type { PaginatedResponse } from '@/types/common.types';
export interface Inventory { id: string; productId: string; warehouseId: string; quantity: number; minimumQuantity: number; maximumQuantity: number; product?: { name: string; sku?: string }; warehouse?: { name: string }; }
export interface InventoryQuery { page?: number; limit?: number; productId?: string; warehouseId?: string; }
export const inventoryApi = { list: async (params: InventoryQuery = {}) => (await api.get<PaginatedResponse<Inventory> | Inventory[]>('/inventories', { params })).data, lowStock: async () => (await api.get<Inventory[]>('/inventories/low-stock')).data, adjust: async (id: string, payload: { quantity: number; reason?: string }) => (await api.put<Inventory>(`/inventories/${id}/adjust`, payload)).data };
