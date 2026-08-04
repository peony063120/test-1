export const STOCK_TRANSACTION_REPOSITORY = 'STOCK_TRANSACTION_REPOSITORY';

export interface IStockTransactionRepository {
  save(transaction: any): Promise<any>;
  findByInventory(inventoryId: string, query: any): Promise<{ data: any[]; total: number }>;
  findByProduct(productId: string, query: any): Promise<{ data: any[]; total: number }>;
  findByReference(referenceId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  getSummary(productId: string, startDate?: Date, endDate?: Date): Promise<any>;
}
