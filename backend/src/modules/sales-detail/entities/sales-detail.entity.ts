export class SalesDetailEntity {
  id?: string;
  salesOrderId!: string;
  productId!: string;
  quantity!: number;
  price!: number;
  createdAt?: Date;
  updatedAt?: Date;
}
