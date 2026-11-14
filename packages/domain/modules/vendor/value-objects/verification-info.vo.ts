import { BadRequestError } from '../../../errors/app-error';
import type { EffectiveDate, Reason } from '../../../value-objects';

export class VerificationInfoVO {
  private constructor(
    readonly isVerified: boolean,
    readonly verifiedAt: EffectiveDate | null,
    readonly rejectedReason: Reason | null,
  ) {}

  static verified(verifiedAt: EffectiveDate): VerificationInfoVO {
    return new VerificationInfoVO(true, verifiedAt, null);
  }

  static rejected(reason: Reason): VerificationInfoVO {
    return new VerificationInfoVO(false, null, reason);
  }

  static pending(): VerificationInfoVO {
    return new VerificationInfoVO(false, null, null);
  }

  verify(verifiedAt: EffectiveDate): VerificationInfoVO {
    if (this.isVerified) {
      throw new BadRequestError('User is already verified.');
    }

    return new VerificationInfoVO(true, verifiedAt, null);
  }

  /**
   * Rejects a pending application or revokes an existing verification.
   * A second rejection is refused so the rejection reason is not silently
   * overwritten.
   */
  reject(reason: Reason): VerificationInfoVO {
    if (this.isRejected) {
      throw new BadRequestError('This vendor verification has already been rejected.');
    }

    return new VerificationInfoVO(false, null, reason);
  }

  reset(): VerificationInfoVO {
    return VerificationInfoVO.pending();
  }
  static none() {
    return new VerificationInfoVO(false, null, null);
  }

  static rehydrate(
    isVerified: boolean,
    verifiedAt: EffectiveDate | null,
    rejectedReason: Reason | null,
  ): VerificationInfoVO {
    return new VerificationInfoVO(isVerified, verifiedAt, rejectedReason);
  }

  get isPending(): boolean {
    return !this.isVerified && this.verifiedAt === null && this.rejectedReason === null;
  }

  get isRejected(): boolean {
    return !this.isVerified && this.rejectedReason !== null;
  }
}
