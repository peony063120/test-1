import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ISalesDetailRepository } from './sales-detail.repository.interface';

@Injectable()
export class SalesDetailRepositoryImpl implements ISalesDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(detail: any) {
    return this.prisma.salesDetail.create({ data: detail });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.salesDetail.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.salesDetail.delete({ where: { id } });
  }

  async findBySalesOrder(salesOrderId: string) {
    return this.prisma.salesDetail.findMany({ where: { salesOrderId } });
  }
}
