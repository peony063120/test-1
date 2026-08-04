import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserEntity } from './entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from './repositories/user.repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateUserDto, currentUserId?: string) {
    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const emailExists = await this.userRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const entity: UserEntity = {
      username: dto.username,
      password: dto.password,
      email: dto.email,
      phone: dto.phone,
      avatar: dto.avatar,
      status: 'ACTIVE',
      roles: [],
    } as UserEntity;

    const created = await this.userRepository.save(entity);
    const createdId = created.id ?? '';
    if (dto.roles?.length) {
      await this.assignRoles(createdId, dto.roles, currentUserId);
    }

    await this.auditLogService.log(currentUserId, 'create', 'user', createdId, null, created, undefined);
    return this.findById(createdId);
  }

  async update(id: string, dto: UpdateUserDto, currentUserId?: string) {
    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(id, {
      ...current,
      ...dto,
    } as UserEntity);

    await this.auditLogService.log(currentUserId, 'update', 'user', id, current, updated, undefined);
    await this.redisService.del(`permissions:${id}`);
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const deleted = await this.userRepository.softDelete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'user', id, current, deleted, undefined);
    await this.redisService.del(`permissions:${id}`);
    return deleted;
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  async findAll(query: UserQueryDto) {
    return this.userRepository.findAll(query);
  }

  async findPermissionsByUserId(userId: string) {
    return this.userRepository.findPermissionsByUserId(userId);
  }

  async changeStatus(id: string, status: string, currentUserId?: string) {
    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(id, { ...current, status } as UserEntity);
    await this.auditLogService.log(currentUserId, 'update_status', 'user', id, current, updated, undefined);
    return updated;
  }

  async assignRoles(id: string, roleIds: string[], currentUserId?: string) {
    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    if (roleIds.length) {
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const updated = await this.userRepository.findById(id);
    await this.auditLogService.log(currentUserId, 'assign_roles', 'user', id, current, updated, undefined);
    await this.redisService.del(`permissions:${id}`);
    return updated;
  }
}
