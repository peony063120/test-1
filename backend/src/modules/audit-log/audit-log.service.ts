import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_LOG_REPOSITORY, IAuditLogRepository } from './repositories/audit-log.repository.interface';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@Injectable()
export class AuditLogService {
  constructor(@Inject(AUDIT_LOG_REPOSITORY) private readonly auditLogRepository: IAuditLogRepository) {}

  async log(userId: string | undefined, action: string, entity: string, entityId: string | undefined, oldValue: unknown, newValue: unknown, ip: string | undefined) {
    return this.auditLogRepository.save({ userId, action, entity, entityId, oldValue, newValue, ip });
  }

  async findAll(query: AuditLogQueryDto) {
    return this.auditLogRepository.findAll(query);
  }

  async findById(id: string) {
    const log = await this.auditLogRepository.findById(id);
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async findByEntity(entity: string, entityId: string) {
    return this.auditLogRepository.findByEntity(entity, entityId);
  }

  async findByUser(userId: string) {
    return this.auditLogRepository.findByUser(userId);
  }
}
