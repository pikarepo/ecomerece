// address.service.ts

import type {
  AddressResponseReadModel,
  createMyAddressDtoType,
  GetAdminPaginatedAddressesQueryDto,
} from '@ecomerece/shared';
import { http } from './../../lib';

/** Matches the backend's standard address mutation response envelope. */
export type AddressMutationResult = {
  message: string;
  updatedData?: AddressResponseReadModel;
};

export type PaginatedAddressesResult = {
  data: AddressResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class AddressService {
  getMyAddresses(): Promise<AddressResponseReadModel[]> {
    return http.get<AddressResponseReadModel[]>('/address/my');
  }

  getAdminPaginatedAddresses(
    params: GetAdminPaginatedAddressesQueryDto,
  ): Promise<PaginatedAddressesResult> {
    const searchParams = new URLSearchParams();
    if (params.ownerId) searchParams.set('ownerId', params.ownerId);
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedAddressesResult>(`/address/admin/all${qs ? `?${qs}` : ''}`);
  }

  createMyAddress(data: createMyAddressDtoType): Promise<AddressMutationResult> {
    return http.post<AddressMutationResult>('/address/my', data);
  }
  updateMyAddress(data: createMyAddressDtoType, id: string): Promise<AddressMutationResult> {
    return http.patch<AddressMutationResult>(`/address/my/${id}/update`, data);
  }

  deleteMyAddress(id: string): Promise<AddressMutationResult> {
    return http.delete<AddressMutationResult>(`/address/my/${id}`);
  }

  setMyAddressAsDefault(id: string): Promise<AddressMutationResult> {
    return http.patch<AddressMutationResult>(`/address/my/${id}/default`);
  }

  recoverAddress(id: string): Promise<AddressMutationResult> {
    return http.patch<AddressMutationResult>(`/address/my/${id}/recover`);
  }
}

export const addressService = new AddressService();
