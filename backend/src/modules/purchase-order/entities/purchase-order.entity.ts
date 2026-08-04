export class PurchaseOrderEntity {
  id?: string;
  supplierId!: string;
  warehouseId!: string;
  status!: 'DRAFT' | 'APPROVED' | 'RECEIVED' | 'CANCELED';
  totalAmount?: number;
  totalTax?: number;
  totalDiscount?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
