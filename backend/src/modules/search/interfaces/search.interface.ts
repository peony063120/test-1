export interface SearchResultItem {
  id: string;
  title: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category?: string;
  brand?: string;
  price?: number;
  status?: string;
  createdAt?: Date;
}
