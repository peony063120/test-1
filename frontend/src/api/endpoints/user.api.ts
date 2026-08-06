import api from '@/api/axios.config'; import type { PaginatedResponse } from '@/types/common.types';
export interface ManagedUser { id: string; username: string; email?: string; phone?: string; avatar?: string; status: string; roles?: { id: string; name: string }[]; permissions?: string[]; lastLogin?: string; createdAt?: string; updatedAt?: string; }
export interface UserPayload { username: string; password?: string; email?: string; phone?: string; avatar?: string; status?: string; roleIds?: string[]; }
export const userApi = {
	list: async (params: Record<string, unknown> = {}) => (await api.get<PaginatedResponse<ManagedUser> | ManagedUser[]>('/users', { params })).data,
	get: async (id: string) => (await api.get<ManagedUser>(`/users/${id}`)).data,
	create: async (payload: UserPayload) => {
		const { roleIds, ...rest } = payload;
		return (await api.post<ManagedUser>('/users', { ...rest, roles: roleIds })).data;
	},
	update: async (id: string, payload: Partial<UserPayload>) => {
		const { roleIds, ...rest } = payload;
		return (await api.put<ManagedUser>(`/users/${id}`, { ...rest, roles: roleIds })).data;
	},
	setStatus: async (id: string, status: string) => (await api.patch<ManagedUser>(`/users/${id}/status`, { status })).data,
	assignRoles: async (id: string, roleIds: string[]) => (await api.post(`/users/${id}/roles`, { roleIds })).data,
};
