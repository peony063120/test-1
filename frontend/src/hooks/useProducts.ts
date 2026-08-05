import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/api/endpoints/product.api';
import type { ProductPayload, ProductQuery } from '@/types/product.types';

export const useProducts = (params: ProductQuery) => useQuery({ queryKey: ['products', params], queryFn: () => productApi.getProducts(params), placeholderData: (previous) => previous });
export const useProduct = (id?: string) => useQuery({ queryKey: ['products', id], queryFn: () => productApi.getProduct(id!), enabled: Boolean(id) });
export const useProductMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] });
  return {
    create: useMutation({ mutationFn: productApi.createProduct, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) => productApi.updateProduct(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: productApi.deleteProduct, onSuccess: invalidate }),
  };
};
