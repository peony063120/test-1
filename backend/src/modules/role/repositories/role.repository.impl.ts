import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RoleQueryDto } from '../dto/role-query.dto';
import { RoleEntity } from '../entities/role.entity';
import { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(role: RoleEntity): Promise<RoleEntity> {
    const created = await this.prisma.role.create({
      data: { name: role.name, description: role.description },
      include: { permissions: { include: { permission: true } } },
    });
    return { ...created, permissions: created.permissions.map((entry: any) => entry.permission) } as RoleEntity;
  }

  async update(id: string, role: Partial<RoleEntity>): Promise<RoleEntity> {
    const updated = await this.prisma.role.update({
      where: { id },
      data: { name: role.name, description: role.description },
      include: { permissions: { include: { permission: true } } },
    });
    return { ...updated, permissions: updated.permissions.map((entry: any) => entry.permission) } as RoleEntity;
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) return null;
    return { ...role, permissions: role.permissions.map((entry: any) => entry.permission) } as RoleEntity;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({ where: { name } });
    return role as RoleEntity | null;
  }

  async findAll(query: RoleQueryDto): Promise<{ data: RoleEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {};
    if (query.filter?.name) where.name = { contains: query.filter.name, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { permissions: { include: { permission: true } } },
        orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: data.map((role: any) => ({ ...role, permissions: role.permissions.map((entry: any) => entry.permission) })),
      total,
    };
  }

  async delete(id: string): Promise<RoleEntity> {
    return this.prisma.role.delete({ where: { id } }) as unknown as RoleEntity;
  }
}
