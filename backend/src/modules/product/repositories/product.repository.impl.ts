import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ProductRepository } from './product.repository.interface';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.product.create({
      data: {
        ...dto,
        deletedAt: null,
      },
    });
  }

  async findMany(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(search?: string) {
    return this.prisma.product.count({
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findFirst({ where: { id, deletedAt: null } });
  }

  async update(id: string, dto: any) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
