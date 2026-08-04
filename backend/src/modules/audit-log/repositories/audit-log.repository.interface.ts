export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface IAuditLogRepository {
  save(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByUser(userId: string): Promise<any[]>;
  findByEntity(entity: string, entityId: string): Promise<any[]>;
  findAll(query?: any): Promise<any>;
}
