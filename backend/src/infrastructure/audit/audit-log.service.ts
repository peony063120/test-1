import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  async log(
    userId: string | undefined,
    action: string,
    entity: string,
    entityId: string | undefined,
    oldValue: unknown,
    newValue: unknown,
    ip: string | undefined,
  ) {
    // Placeholder audit logging; can be replaced with a real persistence layer later.
    return {
      userId,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      ip,
      createdAt: new Date(),
    };
  }
}
