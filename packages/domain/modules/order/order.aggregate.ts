import { BadRequestError } from '../../errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import {
  DeleteInfoVO,
  EffectiveDate,
  type FullAddressVO,
  type Id,
  type Money,
  Quantity,
  type Reason,
} from '../../value-objects';
import { OrderCancelledEvent } from './events/order-cancelled.event';
import { OrderCompletedEvent } from './events/order-completed.event';
import { OrderConfirmedEvent } from './events/order-confirm.event';
import { OrderCreatedEvent } from './events/order-created.event';
import { OrderDeletedEvent } from './events/order-deleted.event';
import { OrderRecoveredEvent } from './events/order-recovered.event';
import { OrderRefundedEvent } from './events/order-refunded.event';
import { OrderReturnedEvent } from './events/order-returned.event';
import { OrderUpdatedEvent } from './events/order-updated.event';
import type { OrderItem } from './value-objects/order-item.vo';
import { OrderStatusVO } from './value-objects/order-status.vo';

export type createOrderPros = {
  id: Id;
  idempotentKey: Id;
  totalPrice: Money;
  buyerId: Id;
  address: FullAddressVO;
};

export class OrderAggregate extends AggregateRoot {
  constructor(
    private readonly _idempotentKey: Id,
    private readonly _id: Id,
    private readonly _buyerId: Id,
    private _totalPrice: Money,
    private _address: FullAddressVO,
    private _status: OrderStatusVO,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }
  get idempotentKey() {
    return this._idempotentKey;
  }
  get id() {
    return this._id;
  }
  get buyerId() {
    return this._buyerId;
  }
  get totalPrice() {
    return this._totalPrice;
  }
  get address() {
    return this._address;
  }
  get status() {
    return this._status;
  }
  get delete() {
    return this._delete;
  }
  get version() {
    return this._version;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(data: createOrderPros): OrderAggregate {
    return new OrderAggregate(
      data.idempotentKey,
      data.id,
      data.buyerId,
      data.totalPrice,
      data.address,
      OrderStatusVO.pending(),
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    _idempotentKey: Id,
    _id: Id,
    _buyerId: Id,
    _totalPrice: Money,
    _address: FullAddressVO,
    _status: OrderStatusVO,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): OrderAggregate {
    return new OrderAggregate(
      _idempotentKey,
      _id,
      _buyerId,
      _totalPrice,
      _address,
      _status,
      _delete,
      _version,
      _createdAt,
    );
  }
  createOrder() {
    this.raise(new OrderCreatedEvent({ orderId: this.id, actorId: this.buyerId }));
  }

  confirmOrder(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.confirm();
    this.raise(new OrderConfirmedEvent({ orderId: this._id, actorId }));
  }

  completeOrder(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.complete();
    this.raise(new OrderCompletedEvent({ orderId: this._id, actorId }));
  }

  cancelOrder(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.cancel();
    this.raise(new OrderCancelledEvent({ orderId: this._id, actorId, reason }));
  }

  returnOrder(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.return();
    this.raise(new OrderReturnedEvent({ orderId: this._id, actorId, reason }));
  }

  refundOrder(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.refund();
    this.raise(new OrderRefundedEvent({ orderId: this._id, actorId, reason }));
  }

  updateOrder(totalPrice: Money, address: FullAddressVO, actorId: Id) {
    this.ensureNotDeleted();
    this._totalPrice = totalPrice;
    this._address = address;
    this.raise(new OrderUpdatedEvent({ orderId: this._id, actorId }));
  }

  deleteOrder(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Order is already deleted.');
    }
    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(
      new OrderDeletedEvent({ orderId: this._id, actorId, deletionInfo: this._delete }),
    );
  }

  recoverOrder(actorId: Id) {
    if (!this._delete.isDeleted) {
      throw new BadRequestError('Order is not deleted.');
    }
    this._delete = DeleteInfoVO.none();
    this.raise(new OrderRecoveredEvent({ orderId: this._id, actorId }));
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Cannot perform operation on a deleted order.');
    }
  }
}
