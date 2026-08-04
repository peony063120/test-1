import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IInventoryRepository } from './inventory.repository.interface';

@Injectable()
export class InventoryRepositoryImpl implements IInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductAndWarehouse(productId: string, warehouseId: string) {
    return this.prisma.inventory.findFirst({ where: { productId, warehouseId } });
  }

  async findByProduct(productId: string) {
    return this.prisma.inventory.findMany({ where: { productId }, include: { warehouse: true } });
  }

  async findByWarehouse(warehouseId: string) {
    return this.prisma.inventory.findMany({ where: { warehouseId }, include: { product: true } });
  }

  async findAll(query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query?.productId) where.productId = query.productId;
    if (query?.warehouseId) where.warehouseId = query.warehouseId;
    if (query?.minQuantity !== undefined) where.quantity = { lte: query.minQuantity };
    if (query?.maxQuantity !== undefined) where.quantity = { gte: query.maxQuantity };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventory.findMany({ where, skip, take: limit, include: { product: true, warehouse: true } }),
      this.prisma.inventory.count({ where }),
    ]);

    return { data, total };
  }

  async save(inventory: any) {
    return this.prisma.inventory.create({ data: inventory });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.inventory.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.inventory.findUnique({ where: { id } });
  }

  async findLowStock(threshold = 0) {
    return this.prisma.inventory.findMany({ where: { quantity: { lte: threshold } } });
  }

  async findOverStock(threshold = 999999) {
    return this.prisma.inventory.findMany({ where: { quantity: { gte: threshold } } });
  }
}
