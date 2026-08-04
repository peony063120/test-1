export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface ProductRepository {
  create(dto: any): Promise<any>;
  findMany(params: { page: number; limit: number; search?: string }): Promise<any[]>;
  count(search?: string): Promise<number>;
  findById(id: string): Promise<any | null>;
  update(id: string, dto: any): Promise<any>;
  softDelete(id: string): Promise<void>;
}
