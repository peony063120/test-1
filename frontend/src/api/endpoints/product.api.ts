import api from '@/api/axios.config';
import type { Product, ProductImage, ProductListResponse, ProductPayload, ProductQuery, ProductVariant } from '@/types/product.types';

export const productApi = {
  getProducts: async (params: ProductQuery = {}) => (await api.get<ProductListResponse>('/products', { params })).data,
  getProduct: async (id: string) => (await api.get<Product>(`/products/${id}`)).data,
  createProduct: async (payload: ProductPayload) => (await api.post<Product>('/products', payload)).data,
  updateProduct: async (id: string, payload: Partial<ProductPayload>) => (await api.patch<Product>(`/products/${id}`, payload)).data,
  deleteProduct: async (id: string) => { await api.delete(`/products/${id}`); },
  searchProducts: async (q: string) => (await api.get<Product[]>('/products/search', { params: { q } })).data,
  getByBarcode: async (barcode: string) => (await api.get<Product>(`/products/barcode/${barcode}`)).data,
  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData(); files.forEach((file) => formData.append('files', file));
    return (await api.post<ProductImage[]>(`/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  deleteImage: async (imageId: string) => { await api.delete(`/products/images/${imageId}`); },
  addVariant: async (id: string, payload: Omit<ProductVariant, 'id'>) => (await api.post<ProductVariant>(`/products/${id}/variants`, payload)).data,
  updateVariant: async (variantId: string, payload: Partial<ProductVariant>) => (await api.put<ProductVariant>(`/products/variants/${variantId}`, payload)).data,
  deleteVariant: async (variantId: string) => { await api.delete(`/products/variants/${variantId}`); },
  importProducts: async (file: File) => { const formData = new FormData(); formData.append('file', file); return (await api.post('/products/import', formData)).data; },
  exportProducts: async () => (await api.get<Blob>('/products/export', { responseType: 'blob' })).data,
};
