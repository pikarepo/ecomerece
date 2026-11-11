import type { Context, Next } from 'hono';
import { getStatsAccessGuard, type IStatsAccessGuard } from './statsAccessGuard';

export interface StatsAccessGuardOptions {
  /** Flex param name holding the entity type (`product` | `vendor` | ...). */
  entityTypeParam?: string;
  /** Flex param name holding the entity id. */
  entityIdParam: string;
  /**
   * `throw` — pass the guard's NotFound/Forbidden through to the global
   * handler (hard reject, used by the product overview route).
   * `mask` — never reject; expose whether full financial stats may be shown
   * via `c.set('statsFullAccess', boolean)` (used by lifetime/timeseries).
   */
  mode: 'throw' | 'mask';
  /** Always treat the entity as a product regardless of `entityTypeParam`. */
  productOnly?: boolean;
  /** Always treat the entity as a vendor regardless of `entityTypeParam`. */
  vendorOnly?: boolean;
  /** Test seam: inject a guard stub. Defaults to the composition-root guard. */
  guard?: IStatsAccessGuard;
}

/**
 * Owner/admin guard for revenue-sensitive stats reads, mounted at the
 * middleware level like the other guards in `apps/api/middleware/`.
 */
export function createStatsAccessGuardMiddleware(options: StatsAccessGuardOptions) {
  const { entityTypeParam, entityIdParam, mode, productOnly, vendorOnly, guard } = options;

  return async (c: Context, next: Next) => {
    const entityId = c.req.param(entityIdParam) ?? '';
    const role = c.get('role');
    const userId = c.get('userId');

    if (mode === 'throw') {
      await (guard ?? getStatsAccessGuard()).ensureProductReadable(entityId, role, userId);
      return next();
    }

    if (role === 'admin') {
      c.set('statsFullAccess', true);
      return next();
    }

    const entityType = productOnly
      ? 'product'
      : vendorOnly
        ? 'vendor'
        : (c.req.param(entityTypeParam ?? '') ?? '');
    if (entityType !== 'product' && entityType !== 'vendor') {
      c.set('statsFullAccess', true);
      return next();
    }

    try {
      await (guard ?? getStatsAccessGuard()).ensureEntityReadable(
        entityType,
        entityId,
        role,
        userId,
      );
      c.set('statsFullAccess', true);
    } catch {
      c.set('statsFullAccess', false);
    }

    return next();
  };
}
