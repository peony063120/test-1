export class StockTransactionEntity {
  id!: string;
  inventoryId!: string;
  transactionType!: string;
  quantity!: number;
  beforeQuantity!: number;
  afterQuantity!: number;
  referenceId?: string | null;
  createdBy?: string | null;
  note?: string | null;
  createdAt!: Date;
}
