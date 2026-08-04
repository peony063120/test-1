import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IPurchaseOrderRepository } from './purchase-order.repository.interface';

@Injectable()
export class PurchaseOrderRepositoryImpl implements IPurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(purchaseOrder: any) {
    return this.prisma.purchaseOrder.create({ data: purchaseOrder });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.purchaseOrder.update({ where: { id }, data });
  }

  async findById(id: string, includeDetails = false) {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: includeDetails ? { details: true, supplier: true, warehouse: true } : undefined,
    });
  }

  async findAll(query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (query?.status) where.status = query.status;
    if (query?.supplierId) where.supplierId = query.supplierId;
    if (query?.warehouseId) where.warehouseId = query.warehouseId;
    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { details: true } }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data, total };
  }

  async findBySupplier(supplierId: string) {
    return this.prisma.purchaseOrder.findMany({ where: { supplierId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async findByStatus(status: any) {
    return this.prisma.purchaseOrder.findMany({ where: { status, deletedAt: null } });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.purchaseOrder.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
  }
}
