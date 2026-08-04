export class SalesOrderEntity {
  id?: string;
  customerId!: string;
  warehouseId!: string;
  status!: 'DRAFT' | 'SHIPPED' | 'CANCELED';
  totalAmount?: number;
  totalTax?: number;
  totalDiscount?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
