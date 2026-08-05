import type { PaginationMeta } from './common.types';

export interface Product {
  id: string;
  name: string;
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
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  supplier?: { id: string; companyName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductPayload {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  price?: number;
  costPrice?: number;
  isActive?: boolean;
  imageUrls?: string[];
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
}

export interface ProductListResponse { items: Product[]; meta: PaginationMeta; }
export interface ProductImage { id: string; url: string; sortOrder?: number; }
export interface ProductVariant { id: string; name: string; sku?: string; price?: number; attributes?: Record<string, string>; }
