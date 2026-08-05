import { createResourceApi, type Resource } from './resource.api';
export interface Supplier extends Resource { companyName: string; contactName?: string; phone?: string; email?: string; address?: string; taxCode?: string; }
export type SupplierPayload = Omit<Supplier, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
export const supplierApi = createResourceApi<Supplier, SupplierPayload>('/suppliers');
