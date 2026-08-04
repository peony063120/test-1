import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_ENTITY_KEY = 'auditLogEntity';
export const AuditLog = (entity: string) => SetMetadata(AUDIT_LOG_ENTITY_KEY, entity);
