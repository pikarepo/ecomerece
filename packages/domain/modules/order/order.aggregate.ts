import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import {
  DeleteInfoVO,
  EffectiveDate,
  type FullAddressVO,
  type Id,
  Money,
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
import { OrderStatusVO } from './value-objects/order-status.vo';
import { OrderTypeVO } from './value-objects/order-type.vo';

export type CreateOrderProps = {
  id: Id;
  idempotentKey: Id;
  totalPrice: Money;
  buyerId: Id;
  vendorIds: Id[];
  orderType: OrderTypeVO;
  address: FullAddressVO;
};

export class OrderAggregate extends AggregateRoot {
  constructor(
    private readonly _idempotentKey: Id,
    private readonly _id: Id,
    private readonly _buyerId: Id,
    private readonly _vendorIds: Id[],
    private readonly _orderType: OrderTypeVO,
    private _totalPrice: Money,
    private _address: FullAddressVO,
    private _status: OrderStatusVO,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
    OrderAggregate.ensureVendorsMatchType(_vendorIds, _orderType);
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
  /** Every vendor this order buys from; a single order has exactly one. */
  get vendorIds(): Id[] {
    return [...this._vendorIds];
  }
  get orderType() {
    return this._orderType;
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

  static create(data: CreateOrderProps): OrderAggregate {
    return new OrderAggregate(
      data.idempotentKey,
      data.id,
      data.buyerId,
      data.vendorIds,
      data.orderType,
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
    _vendorIds: Id[],
    _orderType: OrderTypeVO,
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
      _vendorIds,
      _orderType,
      _totalPrice,
      _address,
      _status,
      _delete,
      _version,
      _createdAt,
    );
  }

  /**
   * The order type is a promise about its vendors: a single order buys from
   * exactly one vendor, while a cart order may buy from many.
   */
  private static ensureVendorsMatchType(vendorIds: Id[], orderType: OrderTypeVO): void {
    if (vendorIds.length === 0) {
      throw new BadRequestError('An order needs at least one vendor.');
    }
    if (orderType.orderType === 'single' && vendorIds.length !== 1) {
      throw new BadRequestError('A single order can only belong to one vendor.');
    }
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

  /**
   * Permission: an order belongs to the buyer who placed it, so only that buyer
   * may read-change or retry it. Admin-only ops are separate use cases.
   */
  ensureOwnedBy(buyerId: Id): void {
    if (!this._buyerId.equals(buyerId)) {
      throw new BadRequestError('You do not own this order.');
    }
  }

  /** Permission: a vendor may only read orders that buy from it. */
  hasVendor(vendorId: Id): boolean {
    return this._vendorIds.some((id) => id.equals(vendorId));
  }

  /**
   * Re-prices the order after failed lines were restored as real items.
   *
   * Only an order that can still change may be re-priced, and the totals passed
   * in are the per-item totals of every line that is now real. The rule itself
   * lives in `OrderStatusVO`, so no caller can re-price a closed order.
   */
  applyRecoveredItems(itemTotals: Money[], actorId: Id) {
    this.ensureNotDeleted();
    this._status.ensureItemsRetryable();
    if (itemTotals.length === 0) {
      throw new BadRequestError('An order needs at least one item to be re-priced.');
    }
    this._totalPrice = itemTotals.reduce(
      (total, itemTotal) => total.addMoney(itemTotal),
      Money.zero(),
    );
    this.raise(new OrderUpdatedEvent({ orderId: this._id, actorId }));
  }

  deleteOrder(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Order is already deleted.');
    }
    if (this._status.status !== 'completed' && this._status.status !== 'cancelled' && this._status.status !== 'refunded' && this._status.status !== 'returned') {
      throw new BadRequestError('Only completed, cancelled, refunded, or returned orders can be deleted.');
    }
    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(new OrderDeletedEvent({ orderId: this._id, actorId, deletionInfo: this._delete }));
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
