import type {
  IPayoutRepository,
  ILedgerRepository,
  LedgerPage,
  PayoutPage,
} from '@ecomerece/domain';
import type { LedgerEntryAggregate, PayoutAggregate } from '@ecomerece/domain';
import { Id, type Quantity } from '@ecomerece/domain/value-objects';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { PayoutMapper } from './payout.mapper';
import {
  LedgerEntryModel,
  PayoutModel,
  type LedgerPersistence,
  type PayoutPersistence,
} from './payout.model';

export class PayoutRepository
  extends MongoRepository<PayoutPersistence>
  implements IPayoutRepository
{
  constructor() {
    super(PayoutModel);
  }
  async FindById(id: Id) {
    const d = await super.findById(id.value);
    return d ? PayoutMapper.persistenceToPayout(d) : null;
  }
  async FindByIdOrThrow(id: Id) {
    const p = await this.FindById(id);
    if (!p) throw new NotFoundError('Payout not found.');
    return p;
  }
  async FindPaginated(params: {
    filter?: { vendorId?: string; status?: string };
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<PayoutPage> {
    const q: FilterQuery<PayoutPersistence> = {};
    if (params.filter?.vendorId) q.vendorId = params.filter.vendorId;
    if (params.filter?.status) q.status = params.filter.status;
    const r = await this.paginateByCursor({
      filter: q,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });
    return {
      data: r.data.map((d: PayoutPersistence) => PayoutMapper.persistenceToPayout(d)),
      meta: r.meta,
    };
  }
  async Create(payout: PayoutAggregate) {
    await super.create(new PayoutModel(PayoutMapper.payoutToPersistence(payout)));
  }
  async Save(payout: PayoutAggregate) {
    const { version: _version, ...data } = PayoutMapper.payoutToPersistence(payout);
    const res = await super.updateOne(
      { _id: payout.id.value, version: payout.version.value },
      { $set: data, $inc: { version: 1 } },
    );
    if (res.modifiedCount === 0) throw new ConcurrencyError();
  }
}

export class LedgerRepository
  extends MongoRepository<LedgerPersistence>
  implements ILedgerRepository
{
  constructor() {
    super(LedgerEntryModel);
  }
  async Create(entry: LedgerEntryAggregate) {
    await super.create(new LedgerEntryModel(PayoutMapper.ledgerToPersistence(entry)));
  }
  async FindByVendor(
    vendorId: Id,
    params: { cursor?: Id; limit?: Quantity; direction?: 'next' | 'prev' },
  ): Promise<LedgerPage> {
    const r = await this.paginateByCursor({
      filter: { vendorId: vendorId.value },
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });
    return {
      data: r.data.map((d: LedgerPersistence) => PayoutMapper.persistenceToLedger(d)),
      meta: r.meta,
    };
  }
  async SumByVendor(vendorId: Id): Promise<number> {
    const rows = await LedgerEntryModel.aggregate([
      { $match: { vendorId: vendorId.value } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return rows[0]?.total ?? 0;
  }
  async ExistsByReference(
    referenceType: string,
    referenceId: string,
    type: string,
  ): Promise<boolean> {
    return !!(await super.exists({ referenceType, referenceId, type }));
  }
}
