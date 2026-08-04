export const SALES_ORDER_REPOSITORY = Symbol('SALES_ORDER_REPOSITORY');

export interface ISalesOrderRepository {
  save(salesOrder: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  findById(id: string, includeDetails?: boolean): Promise<any | null>;
  findAll(query: any): Promise<{ data: any[]; total: number }>;
  findByCustomer(customerId: string): Promise<any[]>;
  findByStatus(status: string): Promise<any[]>;
  updateStatus(id: string, status: string): Promise<any>;
  softDelete(id: string): Promise<void>;
}
