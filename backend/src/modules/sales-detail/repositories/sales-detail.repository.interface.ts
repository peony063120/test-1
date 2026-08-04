export const SALES_DETAIL_REPOSITORY = Symbol('SALES_DETAIL_REPOSITORY');

export interface ISalesDetailRepository {
  save(detail: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  delete(id: string): Promise<void>;
  findBySalesOrder(salesOrderId: string): Promise<any[]>;
}
