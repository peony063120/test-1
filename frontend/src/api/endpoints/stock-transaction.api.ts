import api from '@/api/axios.config';
import type { PaginatedResponse } from '@/types/common.types';
export interface StockTransactionInventory {
	id: string;
	productId: string;
	warehouseId: string;
	product?: { id: string; name: string; sku?: string | null; barcode?: string | null };
	warehouse?: { id: string; name: string; code?: string | null };
}

export interface StockTransaction {
	id: string;
	inventoryId: string;
	transactionType: string;
	quantity: number;
	beforeQuantity: number;
	afterQuantity: number;
	createdAt: string;
	note?: string;
	inventory?: StockTransactionInventory;
}

export const stockTransactionApi = {
	list: async (params: Record<string, string | number | undefined> = {}) => (await api.get<PaginatedResponse<StockTransaction> | StockTransaction[]>('/stock-transactions', { params })).data,
	summary: async (productId: string, startDate?: string, endDate?: string) => (await api.get('/stock-transactions/summary', { params: { productId, startDate, endDate } })).data,
};
