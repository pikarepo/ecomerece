import {
  type IEvent,
  type IEventHandler,
  VendorStatsForceRefreshRequestedEvent,
} from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { connectDB } from '../../../../lib/mongo';
import {
  type VendorForceRefreshConsumeResult,
  vendorForceRefreshQuotaService,
} from '../VendorForceRefreshQuotaService';

export interface VendorStatsForceRefreshDeps {
  connectDB: () => Promise<unknown>;
  refreshVendorData: (vendorId: string) => Promise<void>;
}

/**
 * Vendor-triggered force refresh. Refreshes only the requesting vendor's data:
 * its embedded stats + vendor rollup slots, its products' embedded stats handled
 * by the vendor data refresh, and the categories it sells in. Consumes one unit
 * of the vendor's monthly force-refresh quota.
 */
export class VendorStatsForceRefreshHandler
  implements IEventHandler<VendorStatsForceRefreshRequestedEvent['payload']>
{
  private readonly deps: VendorStatsForceRefreshDeps;

  constructor(deps: Partial<VendorStatsForceRefreshDeps> = {}) {
    this.deps = { ...VendorStatsForceRefreshHandler.defaultDeps(), ...deps };
  }

  private static defaultDeps(): VendorStatsForceRefreshDeps {
    return {
      connectDB,
      refreshVendorData: async () => {
        throw new Error('refreshVendorData dependency is required');
      },
    };
  }

  async handle(event: IEvent<{ vendorId: string; force: boolean }>): Promise<void> {
    void event.payload.force;
    await this.deps.connectDB();
    await this.deps.refreshVendorData(event.payload.vendorId);
  }
}

/**
 * Quota-gated entry point for the vendor "Refresh stats now" button. Consumes
 * one unit of the monthly allowance, then publishes the vendor-scoped force
 * refresh event. Returns the new usage/remaining so the UI can show quotas.
 */
export async function requestVendorStatsForceRefresh(
  vendorId: string,
  eventBus: IEventBus,
): Promise<VendorForceRefreshConsumeResult> {
  const result = await vendorForceRefreshQuotaService.consume(vendorId);
  if (!result.accepted) return result;

  await eventBus.publish(new VendorStatsForceRefreshRequestedEvent({ vendorId, force: true }));
  return result;
}
