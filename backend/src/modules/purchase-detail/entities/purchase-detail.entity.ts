export class PurchaseDetailEntity {
  id?: string;
  purchaseOrderId!: string;
  productId!: string;
  quantity!: number;
  price!: number;
  createdAt?: Date;
  updatedAt?: Date;
}
