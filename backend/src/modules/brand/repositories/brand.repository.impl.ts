import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { BrandEntity } from '../entities/brand.entity';
import { IBrandRepository } from './brand.repository.interface';

@Injectable()
export class BrandRepositoryImpl implements IBrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(brand: BrandEntity): Promise<BrandEntity> {
    return (await this.prisma.brand.create({ data: { name: brand.name, description: brand.description, logo: brand.logo } })) as BrandEntity;
  }

  async update(id: string, brand: Partial<BrandEntity>): Promise<BrandEntity> {
    return (await this.prisma.brand.update({ where: { id }, data: { name: brand.name, description: brand.description, logo: brand.logo } })) as BrandEntity;
  }

  async findById(id: string): Promise<BrandEntity | null> {
    return (await this.prisma.brand.findFirst({ where: { id, deletedAt: null } })) as BrandEntity | null;
  }

  async findByName(name: string): Promise<BrandEntity | null> {
    return (await this.prisma.brand.findFirst({ where: { name, deletedAt: null } })) as BrandEntity | null;
  }

  async findAll(query: any): Promise<{ data: BrandEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { deletedAt: null };
    if (query.filter?.search) where.name = { contains: query.filter.search, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' } }),
      this.prisma.brand.count({ where }),
    ]);

    return { data: data as BrandEntity[], total };
  }

  async softDelete(id: string): Promise<BrandEntity> {
    return (await this.prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } })) as BrandEntity;
  }
}
