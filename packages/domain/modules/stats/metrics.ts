import type { Metrics } from '@ecomerece/shared';

/**
 * Domain-local zeroed metrics factory. Kept separate from the shared public
 * helper so the domain layer has no runtime dependency on packages/shared;
 * the type import is erased at compile time.
 */
export function emptyMetrics(): Required<Metrics> {
  return {
    views: 0,
    clicks: 0,
    purchases: 0,
    revenue: 0,
    quantity: 0,
    addToCart: 0,
    wishlist: 0,
    refunds: 0,
    refundAmount: 0,
  };
}
