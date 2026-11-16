export interface LedgerEntryResponseReadModel {
  id: string; vendorId: string; type: string; amount: number; currency: string;
  referenceType: string | null; referenceId: string | null; note: string | null; createdAt: Date;
}
export interface VendorBalanceResponseReadModel { vendorId: string; balance: number; currency: string; }
export interface PayoutResponseReadModel {
  id: string; vendorId: string; amount: number; currency: string; status: string;
  method: string; destinationRef: string | null; providerRef: string | null; failureReason: string | null; createdAt: Date;
}
