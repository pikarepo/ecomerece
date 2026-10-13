import { EffectiveDate } from './effective-date.vo';
import type { Id } from './id.vo';
import type { Reason } from './reason.vo';

export class BlockInfoVO {
  private constructor(
    readonly performedBy: Id | null,
    readonly blocked: boolean,
    readonly from: EffectiveDate | null,
    readonly reason: Reason | null,
  ) {}

  block(actor: Id, reason: Reason) {
    return new BlockInfoVO(actor, true, EffectiveDate.today(), reason);
  }
  unblock() {
    return new BlockInfoVO(null, false, null, null);
  }

  static none() {
    return new BlockInfoVO(null, false, null, null);
  }

  static create(
    blockedBy: Id | null,

    blockedReason: Reason | null,
  ) {
    return new BlockInfoVO(blockedBy, true, EffectiveDate.today(), blockedReason);
  }

  static rehydrate(
    blockedBy: Id | null,
    blocked: boolean,
    blockedFrom: EffectiveDate | null,
    blockedReason: Reason | null,
  ) {
    return new BlockInfoVO(blockedBy, blocked, blockedFrom, blockedReason);
  }

  get isBlocked(): boolean {
    return this.blocked;
  }
}
