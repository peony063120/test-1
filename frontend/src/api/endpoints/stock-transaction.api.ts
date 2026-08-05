import api from '@/api/axios.config';
import type { PaginatedResponse } from '@/types/common.types';
export interface StockTransaction { id: string; transactionType: string; quantity: number; beforeQuantity: number; afterQuantity: number; createdAt: string; note?: string; }
export const stockTransactionApi = { list: async (params: Record<string, string | number | undefined> = {}) => (await api.get<PaginatedResponse<StockTransaction> | StockTransaction[]>('/stock-transactions', { params })).data };
