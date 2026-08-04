import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IAuditLogRepository } from './audit-log.repository.interface';

@Injectable()
export class AuditLogRepositoryImpl implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: any) {
    return this.prisma.auditLog.create({ data });
  }

  async findById(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({ where: { entity, entityId }, orderBy: { createdAt: 'desc' } });
  }

  async findAll(query: any = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.entity) where.entity = query.entity;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
