import type {
  IEvent,
  IEventHandler,
  ProductStatsDenormalizationRequestedEvent,
} from '@ecomerece/domain';
import { connectDB } from '../../../../lib/mongo';

export interface VendorStatsDenormalizationDeps {
  connectDB: () => Promise<unknown>;
  loadVendors: () => Promise<{ id: string }[]>;
  refreshVendorCore: (vendorId: string) => Promise<void>;
}

/**
 * Denormalized vendor stats (auto-sync). Rolls every non-deleted vendor's product
 * stats up into vendor-level stats — embedded `Vendor.stats` (lifetime) plus
 * lifetime/daily/weekly/monthly slots in the raw Stats collection. Runs on the
 * same `stats.product-denormalization-requested` event as the product and
 * category roll-ups, so the scheduler tick and the admin "Run data correction"
 * action refresh vendor stats too. Uses idempotent `$set` writes — re-runs never
 * double count. Every vendor is refreshed on every run (legacy `statsRefreshEnabled`
 * opt-out is ignored) so dashboards never go stale over long idle windows.
 *
 * Category roll-up is intentionally not duplicated here — the global category
 * handler already covers all categories on the same event. The vendor
 * force-refresh path (its own event) does include categories for its vendor.
 */
export class VendorStatsDenormalizationHandler implements IEventHandler<ProductStatsDenormalizationRequestedEvent['payload']> {
  private readonly deps: VendorStatsDenormalizationDeps;

  constructor(deps: Partial<VendorStatsDenormalizationDeps> = {}) {
    this.deps = { ...VendorStatsDenormalizationHandler.defaultDeps(), ...deps };
  }

  private static defaultDeps(): VendorStatsDenormalizationDeps {
    return {
      connectDB,
      loadVendors: async () => {
        throw new Error('loadVendors dependency is required');
      },
      refreshVendorCore: async () => {
        throw new Error('refreshVendorCore dependency is required');
      },
    };
  }

  async handle(event: IEvent<{ force: boolean }>): Promise<void> {
    // Force vs auto doesn't change scope for vendor stats — vendors are always
    // all refreshed so the stale-data backstop stays effective.
    void event.payload.force;

    await this.deps.connectDB();

    const vendors = await this.deps.loadVendors();
    for (const vendor of vendors) {
      await this.deps.refreshVendorCore(vendor.id);
    }
  }
}
