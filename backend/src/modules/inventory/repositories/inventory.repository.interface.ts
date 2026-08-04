export const INVENTORY_REPOSITORY = 'INVENTORY_REPOSITORY';

export interface IInventoryRepository {
  findByProductAndWarehouse(productId: string, warehouseId: string): Promise<any | null>;
  findByProduct(productId: string): Promise<any[]>;
  findByWarehouse(warehouseId: string): Promise<any[]>;
  findAll(query: any): Promise<{ data: any[]; total: number }>;
  save(inventory: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  findById(id: string): Promise<any | null>;
  findLowStock(threshold?: number): Promise<any[]>;
  findOverStock(threshold?: number): Promise<any[]>;
}
