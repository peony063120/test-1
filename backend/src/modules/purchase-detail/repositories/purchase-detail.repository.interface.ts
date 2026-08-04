export const PURCHASE_DETAIL_REPOSITORY = Symbol('PURCHASE_DETAIL_REPOSITORY');

export interface IPurchaseDetailRepository {
  save(detail: any): Promise<any>;
  update(id: string, data: Partial<any>): Promise<any>;
  delete(id: string): Promise<void>;
  findByPurchaseOrder(purchaseOrderId: string): Promise<any[]>;
}
