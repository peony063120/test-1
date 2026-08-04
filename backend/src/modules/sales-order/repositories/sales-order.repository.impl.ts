import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ISalesOrderRepository } from './sales-order.repository.interface';

@Injectable()
export class SalesOrderRepositoryImpl implements ISalesOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(salesOrder: any) {
    return this.prisma.salesOrder.create({ data: salesOrder });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.salesOrder.update({ where: { id }, data });
  }

  async findById(id: string, includeDetails = false) {
    return this.prisma.salesOrder.findFirst({
      where: { id, deletedAt: null },
      include: includeDetails ? { details: true, customer: true, warehouse: true } : undefined,
    });
  }

  async findAll(query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (query?.status) where.status = query.status;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.warehouseId) where.warehouseId = query.warehouseId;
    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { details: true } }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return { data, total };
  }

  async findByCustomer(customerId: string) {
    return this.prisma.salesOrder.findMany({ where: { customerId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async findByStatus(status: any) {
    return this.prisma.salesOrder.findMany({ where: { status, deletedAt: null } });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.salesOrder.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.salesOrder.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
  }
}
