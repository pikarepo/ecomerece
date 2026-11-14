import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError, ForbiddenError } from '../../errors/app-error';
import { EffectiveDate, type Id, type Reason } from '../../value-objects';
import { OrderRequestAcceptedEvent } from './events/order-request-accepted.event';
import { OrderRequestCancelledEvent } from './events/order-request-cancelled.event';
import { OrderRequestCreatedEvent } from './events/order-request-created.event';
import { OrderRequestRejectedEvent } from './events/order-request-rejected.event';
import { OrderRequestStatusVO } from './value-objects/order-request-status.vo';
import type { OrderRequestTypeVO } from './value-objects/order-request-type.vo';

export type CreateOrderRequestProps = {
  id: Id;
  orderId: Id;
  orderItemId: Id | null;
  vendorId: Id;
  buyerId: Id;
  type: OrderRequestTypeVO;
  reason: Reason;
  note?: string | null;
};

export class OrderRequestAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private readonly _orderId: Id,
    private readonly _orderItemId: Id | null,
    private readonly _vendorId: Id,
    private readonly _buyerId: Id,
    private readonly _type: OrderRequestTypeVO,
    private _status: OrderRequestStatusVO,
    private readonly _reason: Reason,
    private readonly _note: string | null,
    private _vendorResponseNote: string | null,
    private readonly _createdAt: EffectiveDate,
    private _updatedAt: EffectiveDate,
  ) {
    super();
  }

  get id(): Id {
    return this._id;
  }
  get orderId(): Id {
    return this._orderId;
  }
  get orderItemId(): Id | null {
    return this._orderItemId;
  }
  get vendorId(): Id {
    return this._vendorId;
  }
  get buyerId(): Id {
    return this._buyerId;
  }
  get type(): OrderRequestTypeVO {
    return this._type;
  }
  get status(): OrderRequestStatusVO {
    return this._status;
  }
  get reason(): Reason {
    return this._reason;
  }
  get note(): string | null {
    return this._note;
  }
  get vendorResponseNote(): string | null {
    return this._vendorResponseNote;
  }
  get createdAt(): EffectiveDate {
    return this._createdAt;
  }
  get updatedAt(): EffectiveDate {
    return this._updatedAt;
  }

  static create(props: CreateOrderRequestProps): OrderRequestAggregate {
    const aggregate = new OrderRequestAggregate(
      props.id,
      props.orderId,
      props.orderItemId,
      props.vendorId,
      props.buyerId,
      props.type,
      OrderRequestStatusVO.pending(),
      props.reason,
      props.note ?? null,
      null,
      EffectiveDate.today(),
      EffectiveDate.today(),
    );

    aggregate.raise(
      new OrderRequestCreatedEvent({
        requestId: props.id,
        orderId: props.orderId,
        orderItemId: props.orderItemId,
        vendorId: props.vendorId,
        buyerId: props.buyerId,
        type: props.type,
        reason: props.reason,
        note: props.note ?? null,
      }),
    );

    return aggregate;
  }

  static rehydrate(
    id: Id,
    orderId: Id,
    orderItemId: Id | null,
    vendorId: Id,
    buyerId: Id,
    type: OrderRequestTypeVO,
    status: OrderRequestStatusVO,
    reason: Reason,
    note: string | null,
    vendorResponseNote: string | null,
    createdAt: EffectiveDate,
    updatedAt: EffectiveDate,
  ): OrderRequestAggregate {
    return new OrderRequestAggregate(
      id,
      orderId,
      orderItemId,
      vendorId,
      buyerId,
      type,
      status,
      reason,
      note,
      vendorResponseNote,
      createdAt,
      updatedAt,
    );
  }

  accept(actorId: Id, note?: string | null): void {
    if (!this._status.isPending) {
      throw new BadRequestError(`Cannot accept order request that is already ${this._status.value}.`);
    }

    this._status = OrderRequestStatusVO.accepted();
    this._vendorResponseNote = note ?? null;
    this._updatedAt = EffectiveDate.today();

    this.raise(
      new OrderRequestAcceptedEvent({
        requestId: this._id,
        orderId: this._orderId,
        orderItemId: this._orderItemId,
        vendorId: this._vendorId,
        actorId,
        type: this._type,
        reason: this._reason,
        vendorResponseNote: this._vendorResponseNote,
      }),
    );
  }

  reject(actorId: Id, reason: Reason): void {
    if (!this._status.isPending) {
      throw new BadRequestError(`Cannot reject order request that is already ${this._status.value}.`);
    }

    this._status = OrderRequestStatusVO.rejected();
    this._vendorResponseNote = reason.value;
    this._updatedAt = EffectiveDate.today();

    this.raise(
      new OrderRequestRejectedEvent({
        requestId: this._id,
        orderId: this._orderId,
        orderItemId: this._orderItemId,
        vendorId: this._vendorId,
        actorId,
        rejectionReason: reason,
      }),
    );
  }

  cancel(actorId: Id): void {
    if (!this._status.isPending) {
      throw new BadRequestError(`Cannot cancel order request that is already ${this._status.value}.`);
    }
    if (!this._buyerId.equals(actorId)) {
      throw new ForbiddenError('Only the buyer who submitted the request may cancel it.');
    }

    this._status = OrderRequestStatusVO.cancelled();
    this._updatedAt = EffectiveDate.today();

    this.raise(
      new OrderRequestCancelledEvent({
        requestId: this._id,
        orderId: this._orderId,
        buyerId: this._buyerId,
      }),
    );
  }
}
