import type { IVendorStatsProjector } from '@ecomerece/contracts';
import { VendorModel } from './vendor.models';

export class VendorStatsProjector implements IVendorStatsProjector {
  async listVendorIds(): Promise<string[]> {
    const docs = await VendorModel.find({ 'deleted.deleted': false }).select('_id').lean();
    return docs.map((doc) => String(doc._id));
  }

  async setVendorStats(vendorId: string, metrics: Record<string, number>): Promise<void> {
    await VendorModel.updateOne({ _id: vendorId }, { $set: { stats: metrics } });
  }

  async applyStats(
    updates: { vendorId: string; metrics: Record<string, number> }[],
  ): Promise<void> {
    if (updates.length === 0) return;

    await VendorModel.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { _id: update.vendorId },
          update: { $set: { stats: update.metrics } },
        },
      })),
      { ordered: false },
    );
  }
}
