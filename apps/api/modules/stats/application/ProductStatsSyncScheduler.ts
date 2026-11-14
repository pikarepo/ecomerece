import { ProductStatsDenormalizationRequestedEvent } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { redis } from '../../../lib/redis';
import { statsSyncSettingsService } from './StatsSyncSettingsService';
import { effectiveSyncIntervalMs } from './stats-sync-interval';

const KEY_LOCK = 'stats:product:sync_lock';
const DEFAULT_TICK_MS = 60_000;

/**
 * Scheduler only *publishes* a denormalization event when work is due — it never
 * touches products or stats directly. All denormalization work happens in the
 * event handler, so a manual admin "data correction" can reuse the same pipeline.
 *
 * The effective cadence is `min(intervalHours, maxStalenessHours)` — a 24h
 * staleness backstop guarantees dashboards refresh even if the configured
 * interval is much longer (e.g. 7+ days).
 */
export class ProductStatsSyncScheduler {
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly eventBus: IEventBus) {}

  start(tickMs = DEFAULT_TICK_MS): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.tick(), tickMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    try {
      const { intervalHours, lastRun, autoDenormalizeEnabled, maxStalenessHours } =
        await statsSyncSettingsService.getSettings();
      if (!autoDenormalizeEnabled) return;

      const now = Date.now();
      const intervalMs = effectiveSyncIntervalMs(intervalHours, maxStalenessHours);
      if (lastRun && now - lastRun < intervalMs) return;

      const acquired = await redis.set(KEY_LOCK, String(now), {
        NX: true,
        EX: Math.max(Math.round(intervalMs / 1000), 60),
      });
      if (!acquired) return;

      await this.eventBus.publish(new ProductStatsDenormalizationRequestedEvent({ force: false }));
      await statsSyncSettingsService.markRan(now);
    } catch (error) {
      console.error('[stats-sync] scheduler tick failed:', error);
    }
  }
}

/** Admin-triggered "data correction": publishes the same event with force:true. */
export async function triggerProductStatsDenormalization(
  force: boolean,
  eventBus: IEventBus,
): Promise<void> {
  await eventBus.publish(new ProductStatsDenormalizationRequestedEvent({ force }));
  if (force) await statsSyncSettingsService.markRan();
}
