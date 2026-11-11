import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Context, Next } from 'hono';
import { redis } from '../lib/redis';
import { StatsViewGuard, type StatsViewGuardDeps, type ViewEntityType } from './statsViewGuard';

let configuredDeps: Pick<StatsViewGuardDeps, 'productRepo' | 'categoryRepo'> = {};

/** Wired once by the application composition root. */
export function configureStatsViewGuard(
  deps: Pick<StatsViewGuardDeps, 'productRepo' | 'categoryRepo'>,
): void {
  configuredDeps = deps;
}

function defaultGuard(): StatsViewGuard {
  return new StatsViewGuard({
    redis,
    productRepo: configuredDeps.productRepo,
    categoryRepo: configuredDeps.categoryRepo,
  });
}

function clientIp(c: Context): string {
  return (
    c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown'
  );
}

/**
 * Redis anti-abuse guard for view-tracking endpoints, mounted at the
 * middleware level like the other guards in `apps/api/middleware/`.
 *
 * - Bots/duplicates/rate-limited traffic are silently dropped with a 202 so
 *   attackers can't probe the guard.
 * - Approved views are flagged via `c.set('statsViewId', id)`, which the
 *   downstream controller reads instead of re-deciding.
 */
export function createStatsViewGuardMiddleware(
  type: ViewEntityType,
  paramName: string,
  deps: StatsViewGuardDeps = {},
) {
  const guard = Object.keys(deps).length > 0 ? new StatsViewGuard(deps) : defaultGuard();

  return async (c: Context, next: Next) => {
    const rawId = c.req.param(paramName) ?? '';

    let id: string;
    if (type === 'page') {
      // Page keys (home, cart, ...) are slugs, not UUIDs.
      id = rawId;
    } else {
      try {
        id = Id.create(rawId).value;
      } catch {
        return c.json({ message: 'Invalid id format' }, 400);
      }
    }

    const decision = await guard.shouldTrack({
      type,
      id,
      visitorId: c.req.header('x-visitor-id') ?? c.req.query('visitorId'),
      ip: clientIp(c),
      ua: c.req.header('user-agent'),
    });

    if (decision === 'skip') {
      // Silent non-tracking: duplicates, bots, and rate-limited traffic all
      // look identical on the wire so attackers can't probe the guard.
      return c.json({}, 202);
    }

    c.set('statsViewId', id);
    await next();
  };
}
