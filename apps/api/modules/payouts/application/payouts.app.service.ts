import type {
  AuthActor,
  IOrderItemsQueries,
  IPayoutQueries,
  IVendorQueries,
} from '@ecomerece/contracts';
import { LedgerEntryAggregate, PayoutAggregate } from '@ecomerece/domain';
import type {
  IEvent,
  IEventBus,
  IEventHandler,
} from '@ecomerece/domain/events/event-bus.interface';
import { LedgerEntryTypeVO } from '@ecomerece/domain/modules/payouts/value-objects/ledger-entry-type.vo';
import { Id, Money, Quantity, Reason } from '@ecomerece/domain/value-objects';
import type {
  GetAdminPayoutsQueryDto,
  GetLedgerQueryDto,
  GetPayoutsQueryDto,
  payoutActionDtoType,
  requestPayoutDtoType,
} from '@ecomerece/shared';
import { BadRequestError, ForbiddenError } from '../../../errors/app-error';
import { PayoutMapper } from '../infrastructure/payout.mapper';
import type { LedgerRepository, PayoutRepository } from '../infrastructure/payout.repository';

const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE ?? '0.1'); // 10% default

type PaymentCapturedPayload = {
  paymentId: Id;
  orderId: Id;
  amount: Money;
  providerRef: string | null;
};
type PaymentRefundedPayload = {
  paymentId: Id;
  orderId: Id;
  amount: Money;
  reason: Reason;
  partial: boolean;
};

export class PayoutsApplicationService implements IPayoutQueries {
  constructor(
    private readonly payoutRepo: PayoutRepository,
    private readonly ledgerRepo: LedgerRepository,
    private readonly eventBus: IEventBus,
    private readonly vendorQueries: IVendorQueries,
    private readonly orderItemsQueries: IOrderItemsQueries,
  ) {}

  async handlePaymentCaptured(event: IEvent<PaymentCapturedPayload>) {
    const items = await this.orderItemsQueries.getByOrderId(event.payload.orderId);
    // group net per vendor from real (non-failed) lines
    const perVendor = new Map<string, number>();
    for (const it of items) {
      if (!it.vendorId || it.failureReason || !it.totalPrice) continue;
      perVendor.set(it.vendorId, (perVendor.get(it.vendorId) ?? 0) + it.totalPrice);
    }
    const currency = 'USD';
    for (const [vendorId, gross] of perVendor.entries()) {
      const refId = `${event.payload.paymentId.value}:${vendorId}`;
      if (await this.ledgerRepo.ExistsByReference('payment_capture', refId, 'sale_credit'))
        continue;
      const commission = Math.round(gross * COMMISSION_RATE * 100) / 100;
      const net = Math.round((gross - commission) * 100) / 100;
      await this.recordEntry({
        vendorId,
        type: 'sale_credit',
        amount: gross,
        currency,
        referenceType: 'payment_capture',
        referenceId: refId,
        note: `Order ${event.payload.orderId.value} sale`,
      });
      if (commission > 0)
        await this.recordEntry({
          vendorId,
          type: 'commission_debit',
          amount: -commission,
          currency,
          referenceType: 'payment_capture',
          referenceId: refId,
          note: `Platform commission ${(COMMISSION_RATE * 100).toFixed(2)}%`,
        });
      // net is implicit via sum (gross + -commission)
      void net;
    }
  }

  async handlePaymentRefunded(event: IEvent<PaymentRefundedPayload>) {
    const items = await this.orderItemsQueries.getByOrderId(event.payload.orderId);
    const perVendor = new Map<string, number>();
    for (const it of items) {
      if (!it.vendorId || it.failureReason || !it.totalPrice) continue;
      perVendor.set(it.vendorId, (perVendor.get(it.vendorId) ?? 0) + it.totalPrice);
    }
    const totalGross = [...perVendor.values()].reduce((a, b) => a + b, 0) || 1;
    const refund = event.payload.amount.value;
    const currency = 'USD';
    for (const [vendorId, gross] of perVendor.entries()) {
      const share = (gross / totalGross) * refund;
      const commissionShare = Math.round(share * COMMISSION_RATE * 100) / 100;
      const debit = Math.round((share - commissionShare) * 100) / 100;
      const refId = `${event.payload.paymentId.value}:${vendorId}:${Date.now()}`;
      await this.recordEntry({
        vendorId,
        type: 'refund_debit',
        amount: -debit,
        currency,
        referenceType: 'payment_refund',
        referenceId: refId,
        note: `Refund for order ${event.payload.orderId.value}`,
      });
      if (commissionShare > 0)
        await this.recordEntry({
          vendorId,
          type: 'commission_reversal',
          amount: commissionShare,
          currency,
          referenceType: 'payment_refund',
          referenceId: refId,
          note: 'Commission reversed on refund',
        });
    }
  }

  private async recordEntry(input: {
    vendorId: string;
    type: string;
    amount: number;
    currency: string;
    referenceType: string | null;
    referenceId: string | null;
    note: string | null;
  }) {
    const signed = Math.sign(input.amount) * Math.abs(input.amount);
    const entry = LedgerEntryAggregate.create({
      id: Id.create(),
      vendorId: Id.create(input.vendorId),
      type: LedgerEntryTypeVO.create(input.type),
      amount: signed,
      currency: input.currency,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      note: input.note,
    });
    entry.record();
    await this.ledgerRepo.Create(entry);
    await this.eventBus.publish(entry.pullEvents());
    return entry;
  }

  async requestPayout(data: requestPayoutDtoType, actor: AuthActor) {
    const vendor = await this.vendorQueries.ensureActiveByUserId(Id.create(actor._id));
    if (!vendor.vendor || !vendor.active)
      throw new ForbiddenError('No active vendor for this user.');
    const balance = await this.ledgerRepo.SumByVendor(Id.create(vendor.vendor.id));
    if (data.amount > balance)
      throw new BadRequestError(`Insufficient balance. Available: ${balance}`);
    const payout = PayoutAggregate.create({
      id: Id.create(),
      vendorId: Id.create(vendor.vendor.id),
      amount: Money.create(data.amount),
      currency: data.currency,
      method: data.method,
      destinationRef: data.destinationRef ?? null,
    });
    payout.request();
    await this.payoutRepo.Create(payout);
    await this.eventBus.publish(payout.pullEvents());
    // reserve funds by debiting ledger immediately (reversed on fail/cancel)
    await this.recordEntry({
      vendorId: vendor.vendor.id,
      type: 'payout_debit',
      amount: -data.amount,
      currency: data.currency,
      referenceType: 'payout',
      referenceId: payout.id.value,
      note: 'Payout requested',
    });
    return PayoutMapper.payoutToResponse(payout);
  }

  async approvePayout(id: Id, actorId: Id) {
    const p = await this.payoutRepo.FindByIdOrThrow(id);
    p.approve(actorId);
    await this.payoutRepo.Save(p);
    await this.eventBus.publish(p.pullEvents());
    return PayoutMapper.payoutToResponse(p);
  }
  async markPaid(id: Id, providerRef: string | null) {
    const p = await this.payoutRepo.FindByIdOrThrow(id);
    if (p.status.value === 'requested') p.approve(Id.create('system'));
    p.markProcessing();
    p.markPaid(providerRef);
    await this.payoutRepo.Save(p);
    await this.eventBus.publish(p.pullEvents());
    return PayoutMapper.payoutToResponse(p);
  }
  async failPayout(id: Id, reason: string) {
    const p = await this.payoutRepo.FindByIdOrThrow(id);
    p.markFailed(Reason.create(reason));
    await this.payoutRepo.Save(p);
    await this.eventBus.publish(p.pullEvents());
    // reverse debit
    await this.recordEntry({
      vendorId: p.vendorId.value,
      type: 'payout_reversal',
      amount: p.amount.value,
      currency: p.currency,
      referenceType: 'payout',
      referenceId: `${p.id.value}:reversal`,
      note: 'Payout failed reversal',
    });
    return PayoutMapper.payoutToResponse(p);
  }
  async cancelPayout(id: Id, reason: string | null) {
    const p = await this.payoutRepo.FindByIdOrThrow(id);
    p.cancel(reason ? Reason.create(reason) : null);
    await this.payoutRepo.Save(p);
    await this.eventBus.publish(p.pullEvents());
    await this.recordEntry({
      vendorId: p.vendorId.value,
      type: 'payout_reversal',
      amount: p.amount.value,
      currency: p.currency,
      referenceType: 'payout',
      referenceId: `${p.id.value}:cancel-reversal`,
      note: 'Payout cancelled reversal',
    });
    return PayoutMapper.payoutToResponse(p);
  }

  async getMyPayouts(page: GetPayoutsQueryDto, actor: AuthActor) {
    const vendor = await this.vendorQueries.ensureActiveByUserId(Id.create(actor._id));
    if (!vendor.vendor) throw new ForbiddenError('No vendor for this user.');
    const r = await this.payoutRepo.FindPaginated({
      filter: { vendorId: vendor.vendor.id, status: page.status },
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });
    return { data: r.data.map(PayoutMapper.payoutToResponse), meta: r.meta };
  }
  async getAdminPayouts(page: GetAdminPayoutsQueryDto) {
    const r = await this.payoutRepo.FindPaginated({
      filter: { vendorId: page.vendorId, status: page.status },
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });
    return { data: r.data.map(PayoutMapper.payoutToResponse), meta: r.meta };
  }
  async getMyBalance(actor: AuthActor) {
    const vendor = await this.vendorQueries.ensureActiveByUserId(Id.create(actor._id));
    if (!vendor.vendor) throw new ForbiddenError('No vendor for this user.');
    return this.getVendorBalance(Id.create(vendor.vendor.id));
  }
  async getMyLedger(page: GetLedgerQueryDto, actor: AuthActor) {
    const vendor = await this.vendorQueries.ensureActiveByUserId(Id.create(actor._id));
    if (!vendor.vendor) throw new ForbiddenError('No vendor for this user.');
    return this.getLedgerByVendor(Id.create(vendor.vendor.id), page);
  }

  // IPayoutQueries
  async getVendorBalance(vendorId: Id) {
    const balance = await this.ledgerRepo.SumByVendor(vendorId);
    return { vendorId: vendorId.value, balance, currency: 'USD' };
  }
  async getPayoutById(payoutId: Id) {
    const p = await this.payoutRepo.FindById(payoutId);
    return p ? PayoutMapper.payoutToResponse(p) : null;
  }
  async getLedgerByVendor(
    vendorId: Id,
    params: { cursor?: string; limit?: number; direction?: 'next' | 'prev' },
  ) {
    const r = await this.ledgerRepo.FindByVendor(vendorId, {
      cursor: params.cursor ? Id.create(params.cursor) : undefined,
      limit: Quantity.create(params.limit ?? 20),
      direction: params.direction ?? 'next',
    });
    return { data: r.data.map(PayoutMapper.ledgerToResponse), meta: r.meta };
  }
}
