import { BrandEntity } from '../entities/brand.entity';

export const BRAND_REPOSITORY = Symbol('BRAND_REPOSITORY');

export interface IBrandRepository {
  save(brand: BrandEntity): Promise<BrandEntity>;
  update(id: string, brand: Partial<BrandEntity>): Promise<BrandEntity>;
  findById(id: string): Promise<BrandEntity | null>;
  findByName(name: string): Promise<BrandEntity | null>;
  findAll(query: any): Promise<{ data: BrandEntity[]; total: number }>;
  softDelete(id: string): Promise<BrandEntity>;
}
