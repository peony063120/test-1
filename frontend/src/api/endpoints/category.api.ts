import { createResourceApi, type Resource } from './resource.api';
export interface Category extends Resource { name: string; description?: string; image?: string; status?: 'ACTIVE' | 'INACTIVE'; parentId?: string; }
export type CategoryPayload = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export const categoryApi = createResourceApi<Category, CategoryPayload>('/categories');
