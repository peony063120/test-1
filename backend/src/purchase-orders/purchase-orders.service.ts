import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.purchaseOrder.findMany({
      include: { supplier: true, details: true },
    });
  }

  create(data: any) {
    return this.prisma.purchaseOrder.create({
      data: {
        ...data,
        status: data.status || 'DRAFT',
      },
      include: { supplier: true, details: true },
    });
  }
}
