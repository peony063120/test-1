import api from '@/api/axios.config';
import type { PaginatedResponse } from '@/types/common.types';

export interface Resource { id: string; name?: string; createdAt?: string; updatedAt?: string; [key: string]: unknown; }
export interface ResourceQuery { page?: number; limit?: number; search?: string; [key: string]: string | number | boolean | undefined; }

export const createResourceApi = <T extends Resource, TPayload extends Record<string, unknown>>(path: string) => ({
  list: async (params: ResourceQuery = {}) => (await api.get<PaginatedResponse<T> | T[]>(path, { params })).data,
  get: async (id: string) => (await api.get<T>(`${path}/${id}`)).data,
  create: async (payload: TPayload) => (await api.post<T>(path, payload)).data,
  update: async (id: string, payload: Partial<TPayload>) => (await api.put<T>(`${path}/${id}`, payload)).data,
  remove: async (id: string) => { await api.delete(`${path}/${id}`); },
});
