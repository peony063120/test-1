import api from '@/api/axios.config'; import type { PaginatedResponse } from '@/types/common.types';
export interface AuditLog { id: string; userId?: string; action: string; entityType: string; entityId?: string; oldValue?: unknown; newValue?: unknown; createdAt: string; }
export const auditLogApi = { list: async (params: Record<string, unknown> = {}) => (await api.get<PaginatedResponse<AuditLog> | AuditLog[]>('/audit-logs', { params })).data };
