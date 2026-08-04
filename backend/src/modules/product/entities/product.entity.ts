export class ProductEntity {
  id!: string;
  name!: string;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
  unit?: string | null;
  price?: number | null;
  costPrice?: number | null;
  isActive?: boolean | null;
  imageUrls?: string[] | null;
  categoryId?: string | null;
  brandId?: string | null;
  supplierId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date | null;
}
