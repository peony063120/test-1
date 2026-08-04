import { RoleEntity } from '../entities/role.entity';
import { RoleQueryDto } from '../dto/role-query.dto';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
  save(role: RoleEntity): Promise<RoleEntity>;
  update(id: string, role: Partial<RoleEntity>): Promise<RoleEntity>;
  findById(id: string): Promise<RoleEntity | null>;
  findByName(name: string): Promise<RoleEntity | null>;
  findAll(query: RoleQueryDto): Promise<{ data: RoleEntity[]; total: number }>;
  delete(id: string): Promise<RoleEntity>;
}
