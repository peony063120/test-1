import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.inventory.findMany({
      include: { product: true, warehouse: true },
    });
  }

  async adjust(id: string, quantity: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    return this.prisma.inventory.update({
      where: { id },
      data: {
        quantity: inventory.quantity.toNumber() + quantity,
      },
    });
  }
}
