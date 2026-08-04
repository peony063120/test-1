export class WarehouseEntity {
  id!: string;
  name!: string;
  location?: string | null;
  description?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
