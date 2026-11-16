import type { AuthActor, IPaymentQueries } from '@ecomerece/contracts';
import { PaymentAggregate, PaymentWebhookReceivedEvent } from '@ecomerece/domain';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { PaymentProviderVO } from '@ecomerece/domain/modules/payments/value-objects/payment-provider.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type {
  GetAdminPaymentsQueryDto,
  GetMyPaymentsQueryDto,
  capturePaymentDtoType,
  createPaymentDtoType,
  paymentReasonDtoType,
  refundPaymentDtoType,
} from '@ecomerece/shared';
import { BadRequestError, ForbiddenError } from '../../../errors/app-error';
import type { PaymentGatewayRegistry } from '../infrastructure/payment-gateway.factory';
import { resolveGateway } from '../infrastructure/payment-gateway.factory';
import { PaymentMapper } from '../infrastructure/payment.mapper';
import type { PaymentRepository } from '../infrastructure/payment.repository';
import type { PaymentsInternalService } from './payments.internal.service';

export type PaymentListResult = {
  data: ReturnType<typeof PaymentMapper.aggregateToListItemReadModel>[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
};

export class PaymentsApplicationService {
  constructor(
    private readonly repo: PaymentRepository,
    private readonly internal: PaymentsInternalService,
    private readonly eventBus: IEventBus,
    private readonly gateways: PaymentGatewayRegistry,
  ) {}

  async createMyPayment(data: createPaymentDtoType, actor: AuthActor) {
    const orderId = Id.create(data.orderId);
    const order = await this.internal.assertOrderActive(orderId);
    if (order.buyerId !== actor._id) throw new ForbiddenError('You do not own this order.');
    if (!order.totalPrice || order.totalPrice <= 0)
      throw new BadRequestError('Order has no payable amount.');

    const gateway = resolveGateway(this.gateways, data.provider);
    const provider = PaymentProviderVO.create(gateway.name);
    const amount = Money.create(order.totalPrice);

    const intent = await gateway.createIntent({
      orderId: order.id,
      buyerId: actor._id,
      amount,
      currency: data.currency,
    });
    const payment = PaymentAggregate.create({
      id: Id.create(),
      orderId,
      buyerId: Id.create(actor._id),
      provider,
      amount,
      currency: data.currency,
    });
    payment.createIntent();
    // record provider ref on creation if adapter returned one
    payment.attachProviderRef(intent.providerRef ?? null);

    await this.repo.Create(payment);
    await this.eventBus.publish(payment.pullEvents());
    return {
      ...PaymentMapper.aggregateToResponseReadModel(payment),
      providerRef: intent.providerRef,
      clientSecret: intent.clientSecret ?? null,
    };
  }

  async authorizePayment(id: Id, actor: AuthActor) {
    const payment = await this.repo.FindByIdOrThrow(id);
    this.ensureOwner(payment, actor);
    const gw = resolveGateway(this.gateways, payment.provider.value);
    const res = gw.authorize
      ? await gw.authorize({
          orderId: payment.orderId.value,
          buyerId: payment.buyerId.value,
          amount: payment.amount,
          currency: payment.currency,
        })
      : { providerRef: payment.providerRef, success: true };
    if (!res.success) throw new BadRequestError('Authorization failed at provider.');
    payment.authorize(res.providerRef ?? payment.providerRef);
    await this.repo.Save(payment);
    await this.eventBus.publish(payment.pullEvents());
    return PaymentMapper.aggregateToResponseReadModel(payment);
  }

  async capturePayment(id: Id, data: capturePaymentDtoType, actor: AuthActor) {
    const payment = await this.repo.FindByIdOrThrow(id);
    this.ensureOwner(payment, actor);
    const gw = resolveGateway(this.gateways, payment.provider.value);
    const amount = data.amount ? Money.create(data.amount) : null;
    const res = await gw.capture({
      providerRef: payment.providerRef,
      amount: amount ?? payment.amount,
      currency: payment.currency,
    });
    if (!res.success) throw new BadRequestError('Capture failed at provider.');
    payment.capture(amount, res.providerRef ?? payment.providerRef);
    await this.repo.Save(payment);
    await this.eventBus.publish(payment.pullEvents());
    return PaymentMapper.aggregateToResponseReadModel(payment);
  }

  async cancelPayment(id: Id, data: paymentReasonDtoType, actor: AuthActor) {
    const payment = await this.repo.FindByIdOrThrow(id);
    this.ensureOwner(payment, actor);
    const gw = resolveGateway(this.gateways, payment.provider.value);
    if (gw.cancel) await gw.cancel(payment.providerRef);
    payment.cancel(data.reason ? Reason.create(data.reason) : null);
    await this.repo.Save(payment);
    await this.eventBus.publish(payment.pullEvents());
    return PaymentMapper.aggregateToResponseReadModel(payment);
  }

  async refundPayment(id: Id, data: refundPaymentDtoType, scopeActor: AuthActor | null) {
    const payment = await this.repo.FindByIdOrThrow(id);
    const gw = resolveGateway(this.gateways, payment.provider.value);
    const amount = Money.create(data.amount);
    const res = await gw.refund({
      providerRef: payment.providerRef,
      amount,
      currency: payment.currency,
      reason: data.reason,
    });
    if (!res.success) throw new BadRequestError('Refund failed at provider.');
    payment.refund(amount, Reason.create(data.reason));
    await this.repo.Save(payment);
    await this.eventBus.publish(payment.pullEvents());
    return PaymentMapper.aggregateToResponseReadModel(payment);
  }

  async handleWebhook(
    providerName: string,
    payload: unknown,
    headers: Record<string, string | undefined>,
  ) {
    const gw = resolveGateway(this.gateways, providerName);
    if (!gw.parseWebhook) return { accepted: true, ignored: true };
    const evt = await gw.parseWebhook(payload, headers);
    let payment = evt.providerRef ? await this.repo.FindByProviderRef(evt.providerRef) : null;
    if (!payment && evt.orderId) {
      const list = await this.repo.FindByOrderId(Id.create(evt.orderId));
      payment = list[0] ?? null;
    }
    // For now record/ack; concrete state transitions can be extended per event.
    await this.eventBus.publish([
      new PaymentWebhookReceivedEvent({
        paymentId: payment?.id ?? null,
        provider: gw.name,
        providerRef: evt.providerRef,
        event: evt.event,
      }) as never,
    ]);
    return { accepted: true, event: evt.event, paymentId: payment?.id.value ?? null };
  }

  async getMyPayments(page: GetMyPaymentsQueryDto, actor: AuthActor): Promise<PaymentListResult> {
    return this.list(
      {
        buyerId: actor._id,
        orderId: page.orderId,
        status: page.status,
        provider: page.provider,
        deleted: false,
      },
      page,
    );
  }
  async getAdminPayments(page: GetAdminPaymentsQueryDto): Promise<PaymentListResult> {
    return this.list(
      {
        buyerId: page.buyerId,
        orderId: page.orderId,
        status: page.status,
        provider: page.provider,
        deleted: page.deleted ?? false,
      },
      page,
    );
  }
  async getMyPaymentById(id: Id, actor: AuthActor) {
    const p = await this.repo.FindByIdOrThrow(id);
    this.ensureOwner(p, actor);
    return PaymentMapper.aggregateToResponseReadModel(p);
  }
  async getAdminPaymentById(id: Id) {
    return PaymentMapper.aggregateToResponseReadModel(await this.repo.FindByIdOrThrow(id));
  }

  private async list(
    filter: {
      orderId?: string;
      buyerId?: string;
      status?: string;
      provider?: string;
      deleted?: boolean;
    },
    page: { cursor?: string; limit: number; direction: 'next' | 'prev' },
  ): Promise<PaymentListResult> {
    const result = await this.repo.FindPaginated({
      filter,
      cursor: page.cursor ? Id.create(page.cursor) : undefined,
      limit: Quantity.create(page.limit),
      direction: page.direction,
    });
    return { data: result.data.map(PaymentMapper.aggregateToListItemReadModel), meta: result.meta };
  }

  private ensureOwner(payment: PaymentAggregate, actor: AuthActor) {
    if (!payment.buyerId.equals(Id.create(actor._id)))
      throw new ForbiddenError('You do not own this payment.');
  }
}
