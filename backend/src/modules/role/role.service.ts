import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../../infrastructure/audit/audit-log.service';
import { RedisService } from '../../infrastructure/cache/redis.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { RoleEntity } from './entities/role.entity';
import { IRoleRepository, ROLE_REPOSITORY } from './repositories/role.repository.interface';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateRoleDto, currentUserId?: string) {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) throw new BadRequestException('Role already exists');
    const created = await this.roleRepository.save(dto as unknown as RoleEntity);
    await this.auditLogService.log(currentUserId, 'create', 'role', created.id, null, created, undefined);
    return created;
  }

  async update(id: string, dto: UpdateRoleDto, currentUserId?: string) {
    const current = await this.roleRepository.findById(id);
    if (!current) throw new NotFoundException('Role not found');
    const updated = await this.roleRepository.update(id, dto as RoleEntity);
    await this.auditLogService.log(currentUserId, 'update', 'role', id, current, updated, undefined);
    await this.redisService.del('permissions:*');
    return updated;
  }

  async delete(id: string, currentUserId?: string) {
    const current = await this.roleRepository.findById(id);
    if (!current) throw new NotFoundException('Role not found');
    const deleted = await this.roleRepository.delete(id);
    await this.auditLogService.log(currentUserId, 'delete', 'role', id, current, deleted, undefined);
    await this.redisService.del('permissions:*');
    return deleted;
  }

  async findById(id: string) {
    return this.roleRepository.findById(id);
  }

  async findAll(query: RoleQueryDto) {
    return this.roleRepository.findAll(query);
  }

  async assignPermissions(roleId: string, permissionIds: string[], currentUserId?: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length) {
      await this.prisma.rolePermission.createMany({ data: permissionIds.map((permissionId) => ({ roleId, permissionId })) });
    }
    const updated = await this.roleRepository.findById(roleId);
    await this.auditLogService.log(currentUserId, 'assign_permissions', 'role', roleId, role, updated, undefined);
    await this.redisService.del('permissions:*');
    return updated;
  }

  async removePermission(roleId: string, permissionId: string, currentUserId?: string) {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    await this.prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });
    const updated = await this.roleRepository.findById(roleId);
    await this.auditLogService.log(currentUserId, 'remove_permission', 'role', roleId, role, updated, undefined);
    await this.redisService.del('permissions:*');
    return updated;
  }

  async getRoleWithPermissions(id: string) {
    return this.roleRepository.findById(id);
  }
}
