export const WAREHOUSE_REPOSITORY = 'WAREHOUSE_REPOSITORY';

export interface IWarehouseRepository {
  save(warehouse: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  findById(id: string): Promise<any | null>;
  findByName(name: string): Promise<any | null>;
  findAll(query: any): Promise<any>;
  softDelete(id: string): Promise<any>;
  findActive(): Promise<any[]>;
}
