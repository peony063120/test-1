import { createResourceApi, type Resource } from './resource.api';
export interface Brand extends Resource { name: string; description?: string; logo?: string; }
export type BrandPayload = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;
export const brandApi = createResourceApi<Brand, BrandPayload>('/brands');
