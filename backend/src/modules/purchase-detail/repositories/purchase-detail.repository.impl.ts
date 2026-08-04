import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IPurchaseDetailRepository } from './purchase-detail.repository.interface';

@Injectable()
export class PurchaseDetailRepositoryImpl implements IPurchaseDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(detail: any) {
    return this.prisma.purchaseDetail.create({ data: detail });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.purchaseDetail.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.purchaseDetail.delete({ where: { id } });
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    return this.prisma.purchaseDetail.findMany({ where: { purchaseOrderId } });
  }
}
