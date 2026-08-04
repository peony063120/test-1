import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { IWarehouseRepository } from './warehouse.repository.interface';

@Injectable()
export class WarehouseRepositoryImpl implements IWarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(warehouse: any) {
    return this.prisma.warehouse.create({ data: warehouse });
  }

  async update(id: string, data: Partial<any>) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.warehouse.findFirst({ where: { id } });
  }

  async findByName(name: string) {
    return this.prisma.warehouse.findFirst({ where: { name } });
  }

  async findAll(query: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;
    const filter = query?.filter;

    const where: any = {};
    if (filter) {
      where.name = { contains: filter, mode: 'insensitive' as const };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.warehouse.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.warehouse.count({ where }),
    ]);

    return { data, total };
  }

  async softDelete(id: string) {
    return this.prisma.warehouse.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
  }

  async findActive() {
    return this.prisma.warehouse.findMany({ where: {} });
  }
}
