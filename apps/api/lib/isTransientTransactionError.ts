export function isTransientTransactionError(err: any): boolean {
  return err?.errorLabels?.includes('TransientTransactionError') ?? false;
}
