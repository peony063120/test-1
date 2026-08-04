export class InventoryEntity {
  id!: string;
  productId!: string;
  warehouseId!: string;
  quantity!: number;
  minimumQuantity!: number;
  maximumQuantity!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
