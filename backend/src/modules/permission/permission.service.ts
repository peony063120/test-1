import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { PermissionEntity } from './entities/permission.entity';
import { IPermissionRepository, PERMISSION_REPOSITORY } from './repositories/permission.repository.interface';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY) private readonly permissionRepository: IPermissionRepository,
    private readonly auditLogService: AuditLogService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreatePermissionDto, currentUserId?: string) {
    const existing = await this.permissionRepository.findByCode(dto.code);
    if (existing) throw new BadRequestException('Permission already exists');
    const created = await this.permissionRepository.save(dto as PermissionEntity);
    await this.auditLogService.log(currentUserId, 'create', 'permission', created.id, null, created, undefined);
    await this.redisService.del('permissions:*');
    return created;
  }

  async update(id: string, dto: UpdatePermissionDto, currentUserId?: string) {
    const current = await this.permissionRepository.findById(id);
    if (!current) throw new NotFoundException('Permission not found');
    const updated = await this.permissionRepository.update(id, dto as PermissionEntity);
    await this.auditLogService.log(currentUserId, 'update', 'permission', id, current, updated, undefined);
    await this.redisService.del('permissions:*');
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.permissionRepository.findById(id);
    if (!current) throw new NotFoundException('Permission not found');
    const deleted = await this.permissionRepository.delete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'permission', id, current, deleted, undefined);
    await this.redisService.del('permissions:*');
    return deleted;
  }

  async findById(id: string) {
    return this.permissionRepository.findById(id);
  }

  async findAll(query: PermissionQueryDto) {
    return this.permissionRepository.findAll(query);
  }
}
