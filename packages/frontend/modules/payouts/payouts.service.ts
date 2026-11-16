import type {
  GetAdminPayoutsQueryDto,
  GetLedgerQueryDto,
  GetPayoutsQueryDto,
  LedgerEntryResponseReadModel,
  PayoutResponseReadModel,
  VendorBalanceResponseReadModel,
  payoutActionDtoType,
  requestPayoutDtoType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export type PayoutListResult = {
  data: PayoutResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};
export type LedgerListResult = {
  data: LedgerEntryResponseReadModel[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== '') sp.set(k, String(v));
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export class PayoutsService {
  getMyBalance(): Promise<VendorBalanceResponseReadModel> {
    return http.get('/payout/vendor/me/balance');
  }
  getMyLedger(params: GetLedgerQueryDto): Promise<LedgerListResult> {
    return http.get(`/payout/vendor/me/ledger${buildQuery(params as any)}`);
  }
  getMyPayouts(params: GetPayoutsQueryDto): Promise<PayoutListResult> {
    return http.get(`/payout/vendor/me/all${buildQuery(params as any)}`);
  }
  requestPayout(data: requestPayoutDtoType): Promise<PayoutResponseReadModel> {
    return http.post('/payout/vendor/me', data);
  }

  getAdminPayouts(params: GetAdminPayoutsQueryDto): Promise<PayoutListResult> {
    return http.get(`/payout/admin/all${buildQuery(params as any)}`);
  }
  getAdminBalance(vendorId: string): Promise<VendorBalanceResponseReadModel> {
    return http.get(`/payout/admin/vendor/${vendorId}/balance`);
  }
  approvePayout(id: string): Promise<PayoutResponseReadModel> {
    return http.post(`/payout/admin/${id}/approve`, {});
  }
  markPaid(id: string, data: payoutActionDtoType): Promise<PayoutResponseReadModel> {
    return http.post(`/payout/admin/${id}/mark-paid`, data);
  }
  failPayout(id: string, data: payoutActionDtoType): Promise<PayoutResponseReadModel> {
    return http.post(`/payout/admin/${id}/fail`, data);
  }
  cancelPayout(id: string, data: payoutActionDtoType): Promise<PayoutResponseReadModel> {
    return http.post(`/payout/admin/${id}/cancel`, data);
  }
}

export const payoutsService = new PayoutsService();
