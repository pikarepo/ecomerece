import { BadRequestError } from '../errors/app-error';
import type { EffectiveDate } from './effective-date.vo';
import type { ExpirationDate } from './expiration-date.vo';
import type { Id } from './id.vo';
import type { Reason } from './reason.vo';

export class BanInfoVO {
  private constructor(
    readonly performedBy: Id | null,
    readonly from: EffectiveDate | null,
    readonly until: ExpirationDate | null,
    readonly reason: Reason | null,
  ) {}

  private static assertDays(days: number): void {
    if (!Number.isInteger(days) || days <= 0) {
      throw new BadRequestError('Days must be a positive whole number.');
    }
  }

  private static assertWindow(
    performedBy: Id | null,
    from: EffectiveDate | null,
    until: ExpirationDate | null,
    reason: Reason | null,
  ): void {
    if (!performedBy || !from || !until || !reason) {
      throw new BadRequestError('Invalid ban information.');
    }

    if (!until.after(from.value)) {
      throw new BadRequestError('Ban end date must be after start date.');
    }
  }

  ban(performedBy: Id, from: EffectiveDate, until: ExpirationDate, reason: Reason) {
    BanInfoVO.assertWindow(performedBy, from, until, reason);

    return new BanInfoVO(performedBy, from, until, reason);
  }

  extend(days: number): BanInfoVO {
    BanInfoVO.assertDays(days);
    if (!this.isBan) {
      throw new BadRequestError('User is not currently banned.');
    }

    if (!this.performedBy || !this.from || !this.until) {
      throw new BadRequestError('Invalid ban information.');
    }

    return new BanInfoVO(this.performedBy, this.from, this.until.addDays(days), this.reason);
  }
  static none() {
    return new BanInfoVO(null, null, null, null);
  }

  shorten(days: number): BanInfoVO {
    BanInfoVO.assertDays(days);
    if (!this.isBan) {
      throw new BadRequestError('User is not currently banned.');
    }
    if (!this.performedBy || !this.from || !this.until) {
      throw new BadRequestError('Invalid ban information.');
    }

    const until = this.until.subtractDays(days);
    if (until.remainingDays <= 0) {
      throw new BadRequestError('Invalid ban subtraction.');
    }

    return new BanInfoVO(this.performedBy, this.from, until, this.reason);
  }
  static create(
    bannedBy: Id | null,
    from: EffectiveDate | null,
    bannedUntil: ExpirationDate | null,
    reason: Reason | null,
  ) {
    if (!bannedBy && !from && !bannedUntil && !reason) {
      return BanInfoVO.none();
    }

    BanInfoVO.assertWindow(bannedBy, from, bannedUntil, reason);

    return new BanInfoVO(bannedBy, from, bannedUntil, reason);
  }
  static rehydrate(
    bannedBy: Id | null,
    from: EffectiveDate | null,
    bannedUntil: ExpirationDate | null,
    reason: Reason | null,
  ) {
    if ((from && !bannedUntil) || (bannedUntil && !from)) {
      throw new BadRequestError('Invalid ban information.');
    }

    if (from && bannedUntil && !bannedUntil.after(from.value)) {
      throw new BadRequestError('Ban end date must be after start date.');
    }

    return new BanInfoVO(bannedBy, from, bannedUntil, reason);
  }
  get isBan(): boolean {
    if (!this.until) return false;
    return this.until.isFuture;
  }
}
