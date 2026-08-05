import { createResourceApi, type Resource } from './resource.api';
export interface Warehouse extends Resource { name: string; code?: string; address?: string; phone?: string; managerName?: string; isActive?: boolean; }
export type WarehousePayload = Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>;
export const warehouseApi = createResourceApi<Warehouse, WarehousePayload>('/warehouses');
