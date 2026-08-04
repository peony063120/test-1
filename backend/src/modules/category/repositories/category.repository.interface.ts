import { CategoryEntity } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export interface ICategoryRepository {
  save(category: CategoryEntity): Promise<CategoryEntity>;
  update(id: string, category: Partial<CategoryEntity>): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  findAll(query: any): Promise<{ data: CategoryEntity[]; total: number }>;
  findTree(): Promise<CategoryEntity[]>;
  softDelete(id: string): Promise<CategoryEntity>;
  findChildren(parentId: string): Promise<CategoryEntity[]>;
  findParents(childId: string): Promise<CategoryEntity[]>;
}
