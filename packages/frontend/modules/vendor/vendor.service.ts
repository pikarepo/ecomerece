// vendor.service.ts

import type {
  CreateVendorDto,
  DeleteMyVendorDto,
  DeleteVendorDto,
  GetAdminPaginatedVendorsQueryDto,
  GetPaginatedVendorsQueryDto,
  RecoverVendorDto,
  RejectVendorDto,
  UpdateMyVendorContactDto,
  UpdateMyVendorImageDto,
  UpdateMyVendorMetaDto,
  UpdateVendorStatsRefreshDto,
  VendorListItemReadModel,
  VendorPublicResponseReadModel,
  VendorResponseReadModel,
  VerifyVendorDto,
} from '@ecomerece/shared';
import { http } from './../../lib';

/** Matches the backend's standard vendor mutation response envelope. */
export type VendorMutationResult = {
  message: string;
  updatedData?: VendorResponseReadModel;
};

export class VendorService {
  getVendorById(id: string): Promise<VendorPublicResponseReadModel> {
    return http.get<VendorPublicResponseReadModel>(`/vendor/${id}`);
  }

  getMyVendor(): Promise<VendorResponseReadModel> {
    return http.get<VendorResponseReadModel>('/vendor/me');
  }

  createMyVendor(data: CreateVendorDto): Promise<VendorMutationResult> {
    return http.post<VendorMutationResult>('/vendor/me', data);
  }

  deleteMyVendor(data: DeleteMyVendorDto): Promise<VendorMutationResult> {
    return http.delete<VendorMutationResult>('/vendor/me', data);
  }

  softDeleteVendor(data: DeleteVendorDto): Promise<VendorMutationResult> {
    return http.delete<VendorMutationResult>('/vendor/admin/soft', data);
  }

  recoverVendor(data: RecoverVendorDto): Promise<VendorMutationResult> {
    return http.patch<VendorMutationResult>('/vendor/admin/recover', data);
  }

  verifyVendor(data: VerifyVendorDto): Promise<VendorMutationResult> {
    return http.patch<VendorMutationResult>('/vendor/admin/verify', data);
  }

  rejectVendorVerification(data: RejectVendorDto): Promise<VendorMutationResult> {
    return http.patch<VendorMutationResult>('/vendor/admin/reject', data);
  }

  updateMyStatsRefresh(data: UpdateVendorStatsRefreshDto): Promise<VendorResponseReadModel> {
    return http.patch<VendorResponseReadModel>('/vendor/me/stats-refresh', data);
  }

  updateMyVendorMeta(data: UpdateMyVendorMetaDto): Promise<VendorResponseReadModel> {
    return http.patch<VendorResponseReadModel>('/vendor/me/meta', data);
  }

  updateMyVendorContact(data: UpdateMyVendorContactDto): Promise<VendorResponseReadModel> {
    return http.patch<VendorResponseReadModel>('/vendor/me/contact', data);
  }

  updateMyVendorImage(data: UpdateMyVendorImageDto): Promise<VendorResponseReadModel> {
    return http.patch<VendorResponseReadModel>('/vendor/me/image', data);
  }

  getPaginatedVendors(params: GetPaginatedVendorsQueryDto): Promise<{
    data: VendorListItemReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.append('cursor', params.cursor);
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.direction) searchParams.append('direction', params.direction);
    if (params.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const url = query ? `/vendor?${query}` : '/vendor';

    return http.get(url);
  }

  getAdminPaginatedVendors(params: GetAdminPaginatedVendorsQueryDto): Promise<{
    data: VendorListItemReadModel[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.append('cursor', params.cursor);
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.direction) searchParams.append('direction', params.direction);
    if (params.search) searchParams.append('search', params.search);
    if (params.deleted !== undefined) searchParams.append('deleted', String(params.deleted));
    if (params.verified !== undefined) searchParams.append('verified', String(params.verified));

    const query = searchParams.toString();
    const url = query ? `/vendor/admin/all?${query}` : '/vendor/admin/all';

    return http.get(url);
  }

  getAdminVendorById(id: string): Promise<VendorResponseReadModel> {
    return http.get<VendorResponseReadModel>(`/vendor/admin/${id}`);
  }
}

export const vendorService = new VendorService();
