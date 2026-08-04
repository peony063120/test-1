import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CategoryEntity } from '../entities/category.entity';
import { ICategoryRepository } from './category.repository.interface';

@Injectable()
export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(category: CategoryEntity): Promise<CategoryEntity> {
    const created = await this.prisma.category.create({
      data: {
        name: category.name,
        parentId: category.parentId || null,
        description: category.description,
        image: category.image,
        status: category.status || 'ACTIVE',
      },
    });
    return created as CategoryEntity;
  }

  async update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        parentId: category.parentId ?? undefined,
        name: category.name,
        description: category.description,
        image: category.image,
        status: category.status,
      },
    });
    return updated as CategoryEntity;
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return (await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: { children: true, parent: true },
    })) as CategoryEntity | null;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    return (await this.prisma.category.findFirst({ where: { name, deletedAt: null } })) as CategoryEntity | null;
  }

  async findAll(query: any): Promise<{ data: CategoryEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { deletedAt: null };

    if (query.filter?.parentId !== undefined) {
      where.parentId = query.filter.parentId;
    }
    if (query.filter?.status) {
      where.status = query.filter.status;
    }
    if (query.filter?.search) {
      where.name = { contains: query.filter.search, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data: data as CategoryEntity[], total };
  }

  async findTree(): Promise<CategoryEntity[]> {
    const data = await this.prisma.category.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } });
    return data as CategoryEntity[];
  }

  async softDelete(id: string): Promise<CategoryEntity> {
    return (await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    })) as CategoryEntity;
  }

  async findChildren(parentId: string): Promise<CategoryEntity[]> {
    return (await this.prisma.category.findMany({ where: { parentId, deletedAt: null } })) as CategoryEntity[];
  }

  async findParents(childId: string): Promise<CategoryEntity[]> {
    const chain: CategoryEntity[] = [];
    let current: CategoryEntity | null = (await this.prisma.category.findUnique({ where: { id: childId } })) as CategoryEntity | null;

    while (current?.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: current.parentId } });
      if (!parent) break;
      chain.unshift(parent as CategoryEntity);
      current = parent as CategoryEntity | null;
    }

    return chain;
  }
}
