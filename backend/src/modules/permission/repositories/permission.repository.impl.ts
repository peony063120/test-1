import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { PermissionQueryDto } from '../dto/permission-query.dto';
import { PermissionEntity } from '../entities/permission.entity';
import { IPermissionRepository } from './permission.repository.interface';

@Injectable()
export class PermissionRepositoryImpl implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.prisma.permission.create({ data: permission }) as unknown as PermissionEntity;
  }

  async update(id: string, permission: Partial<PermissionEntity>): Promise<PermissionEntity> {
    return this.prisma.permission.update({ where: { id }, data: permission }) as unknown as PermissionEntity;
  }

  async findById(id: string): Promise<PermissionEntity | null> {
    return this.prisma.permission.findUnique({ where: { id } }) as unknown as PermissionEntity | null;
  }

  async findByCode(code: string): Promise<PermissionEntity | null> {
    return this.prisma.permission.findUnique({ where: { code } }) as unknown as PermissionEntity | null;
  }

  async findAll(query: PermissionQueryDto): Promise<{ data: PermissionEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {};
    if (query.filter?.name) where.name = { contains: query.filter.name, mode: 'insensitive' };
    if (query.filter?.code) where.code = { contains: query.filter.code, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' } }),
      this.prisma.permission.count({ where }),
    ]);

    return { data: data as PermissionEntity[], total };
  }

  async delete(id: string): Promise<PermissionEntity> {
    return this.prisma.permission.delete({ where: { id } }) as unknown as PermissionEntity;
  }
}
