import { UserEntity } from '../entities/user.entity';
import { UserQueryDto } from '../dto/user-query.dto';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  softDelete(id: string): Promise<UserEntity>;
  findAll(query: UserQueryDto): Promise<{ data: UserEntity[]; total: number }>;
  findPermissionsByUserId(userId: string): Promise<string[]>;
}
