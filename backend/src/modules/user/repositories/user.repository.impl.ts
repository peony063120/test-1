import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from './user.repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: UserEntity): Promise<UserEntity> {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const created = await this.prisma.user.create({
      data: {
        username: user.username,
        passwordHash,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: (user.status as any) || 'ACTIVE',
      },
      include: { roles: { include: { role: true } } },
    });

    return {
      ...created,
      password: '',
      roles: created.roles.map((entry: any) => entry.role),
    } as UserEntity;
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status as any,
      },
      include: { roles: { include: { role: true } } },
    });

    return {
      ...updated,
      password: '',
      roles: updated.roles.map((entry: any) => entry.role),
    } as UserEntity;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    return { ...user, password: '', roles: user.roles.map((entry: any) => entry.role) } as UserEntity;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { username, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    return { ...user, password: '', roles: user.roles.map((entry: any) => entry.role) } as UserEntity;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    return { ...user, password: '', roles: user.roles.map((entry: any) => entry.role) } as UserEntity;
  }

  async softDelete(id: string): Promise<UserEntity> {
    const deleted = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      include: { roles: { include: { role: true } } },
    });
    return { ...deleted, password: '', roles: deleted.roles.map((entry: any) => entry.role) } as UserEntity;
  }

  async findAll(query: UserQueryDto): Promise<{ data: UserEntity[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { deletedAt: null };

    if (query.filter?.username) where.username = { contains: query.filter.username, mode: 'insensitive' };
    if (query.filter?.email) where.email = { contains: query.filter.email, mode: 'insensitive' };
    if (query.filter?.status) where.status = query.filter.status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { roles: { include: { role: true } } },
        orderBy: query.sort ? { [query.sort]: 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((user: any) => ({ ...user, password: '', roles: user.roles.map((entry: any) => entry.role) })),
      total,
    };
  }

  async findPermissionsByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });

    return userRoles.flatMap((entry: any) => entry.role.permissions.map((perm: any) => perm.permission.code));
  }
}
