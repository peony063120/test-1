import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IStockTransactionRepository } from './stock-transaction.repository.interface';

@Injectable()
export class StockTransactionRepositoryImpl implements IStockTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(transaction: any) {
    return this.prisma.stockTransaction.create({ data: transaction });
  }

  async findByInventory(inventoryId: string, query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const where = { inventoryId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      }),
      this.prisma.stockTransaction.count({ where }),
    ]);
    return { data, total };
  }

  async findByProduct(productId: string, query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const where = { inventory: { productId } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      }),
      this.prisma.stockTransaction.count({ where }),
    ]);
    return { data, total };
  }

  async findByReference(referenceId: string) {
    return this.prisma.stockTransaction.findMany({ where: { referenceId } });
  }

  async findById(id: string) {
    return this.prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            product: true,
            warehouse: true,
          },
        },
      },
    });
  }

  async getSummary(productId: string, startDate?: Date, endDate?: Date) {
    const where: any = { inventory: { productId } };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return this.prisma.stockTransaction.groupBy({
      by: ['transactionType'],
      where,
      _sum: { quantity: true },
    });
  }
}
