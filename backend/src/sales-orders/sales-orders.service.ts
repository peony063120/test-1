import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.salesOrder.findMany({
      include: { customer: true, details: true },
    });
  }

  create(data: any) {
    return this.prisma.salesOrder.create({
      data: {
        ...data,
        status: data.status || 'DRAFT',
      },
      include: { customer: true, details: true },
    });
  }
}
