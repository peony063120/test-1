import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Resource, ResourceQuery } from '@/api/endpoints/resource.api';

type Api<T extends Resource, P extends Record<string, unknown>> = { list: (query?: ResourceQuery) => Promise<T[] | { items: T[]; meta: { total: number } }>; get: (id: string) => Promise<T>; create: (payload: P) => Promise<T>; update: (id: string, payload: Partial<P>) => Promise<T>; remove: (id: string) => Promise<void>; };
export const useResource = <T extends Resource, P extends Record<string, unknown>>(key: string, service: Api<T, P>, query: ResourceQuery = {}) => {
  const client = useQueryClient(); const invalidate = () => client.invalidateQueries({ queryKey: [key] });
  const list = useQuery({ queryKey: [key, query], queryFn: () => service.list(query) });
  return { list, create: useMutation({ mutationFn: service.create, onSuccess: invalidate }), update: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<P> }) => service.update(id, payload), onSuccess: invalidate }), remove: useMutation({ mutationFn: service.remove, onSuccess: invalidate }) };
};
