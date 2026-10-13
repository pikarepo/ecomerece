import { EffectiveDate } from './effective-date.vo';
import type { Id } from './id.vo';
import type { Reason } from './reason.vo';

export class DeleteInfoVO {
  private constructor(
    readonly performedBy: Id | null,
    readonly deleted: boolean,
    readonly from: EffectiveDate | null,
    readonly reason: Reason | null,
  ) {}

  static create(deletedBy: Id, reason: Reason) {
    return new DeleteInfoVO(deletedBy, true, new EffectiveDate(new Date()), reason);
  }

  static none() {
    return new DeleteInfoVO(null, false, null, null);
  }

  static rehydrate(
    deletedBy: Id | null,
    deleted: boolean,
    deletedFrom: EffectiveDate | null,
    deletionReason: Reason | null,
  ) {
    return new DeleteInfoVO(deletedBy, deleted, deletedFrom, deletionReason);
  }

  get isDeleted(): boolean {
    return this.deleted;
  }
}
