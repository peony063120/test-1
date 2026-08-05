import { createResourceApi, type Resource } from './resource.api';
export interface Customer extends Resource { name: string; email?: string; phone?: string; address?: string; }
export type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export const customerApi = createResourceApi<Customer, CustomerPayload>('/customers');
