import { PermissionEntity } from '../entities/permission.entity';
import { PermissionQueryDto } from '../dto/permission-query.dto';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface IPermissionRepository {
  save(permission: PermissionEntity): Promise<PermissionEntity>;
  update(id: string, permission: Partial<PermissionEntity>): Promise<PermissionEntity>;
  findById(id: string): Promise<PermissionEntity | null>;
  findByCode(code: string): Promise<PermissionEntity | null>;
  findAll(query: PermissionQueryDto): Promise<{ data: PermissionEntity[]; total: number }>;
  delete(id: string): Promise<PermissionEntity>;
}
