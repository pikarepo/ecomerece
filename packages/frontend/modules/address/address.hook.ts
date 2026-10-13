// address.hook.ts

import {
  type AddressResponseReadModel,
  createMyAddressDto,
  type createMyAddressDtoType,
  type GetAdminPaginatedAddressesQueryDto,
  getAdminPaginatedAddressesQuerySchema,
  type updateMyAddressDtoType,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AddressMutationResult, addressService } from './address.service';

export const ADDRESS_QUERY_KEY = ['addresses'];

export function useGetMyAddresses() {
  return useQuery({
    queryKey: [...ADDRESS_QUERY_KEY, 'me'],
    queryFn: () => addressService.getMyAddresses(),
  });
}

export function useGetAdminPaginatedAddresses(params: GetAdminPaginatedAddressesQueryDto) {
  return useQuery({
    queryKey: [...ADDRESS_QUERY_KEY, 'admin-paginated', params],
    queryFn: () =>
      addressService.getAdminPaginatedAddresses(
        getAdminPaginatedAddressesQuerySchema.parse(params),
      ),
  });
}

function applyAddressMutationResult(queryClient: QueryClient, result: AddressMutationResult) {
  const updated = result.updatedData;

  if (!updated) {
    queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEY });
    return;
  }

  queryClient.setQueryData([...ADDRESS_QUERY_KEY, updated.id], updated);

  queryClient.setQueryData<AddressResponseReadModel[] | undefined>(
    [...ADDRESS_QUERY_KEY, 'me'],
    (old) => {
      if (!old) return [updated];
      const exists = old.some((item) => item.id === updated.id);
      if (exists) {
        return old.map((item) => (item.id === updated.id ? updated : item));
      }
      return [...old, updated];
    },
  );
}

export function useCreateMyAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createMyAddressDtoType) =>
      addressService.createMyAddress(createMyAddressDto.parse(data)),
    onSuccess: (data) => applyAddressMutationResult(queryClient, data),
  });
}

export function useDeleteMyAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.deleteMyAddress(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData<AddressResponseReadModel[] | undefined>(
        [...ADDRESS_QUERY_KEY, 'me'],
        (old) => old?.filter((item) => item.id !== id),
      );
      applyAddressMutationResult(queryClient, data);
    },
  });
}

export function useSetMyAddressAsDefault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setMyAddressAsDefault(id),
    onSuccess: (data) => applyAddressMutationResult(queryClient, data),
  });
}

export function useUpdateMyAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: updateMyAddressDtoType }) =>
      addressService.updateMyAddress(data, id),
    onSuccess: (data) => applyAddressMutationResult(queryClient, data),
  });
}

export function useRecoverAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.recoverAddress(id),
    onSuccess: (data) => applyAddressMutationResult(queryClient, data),
  });
}
