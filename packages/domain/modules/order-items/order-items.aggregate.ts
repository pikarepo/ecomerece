import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import {
  DeleteInfoVO,
  EffectiveDate,
  type ExpirationDate,
  type Id,
  Money,
  Quantity,
} from '../../value-objects';
import { OrderItemCancelledEvent } from './events/order-item-cancelled.event';
import { OrderItemCompletedEvent } from './events/order-item-completed.event';
import { OrderItemConfirmedEvent } from './events/order-item-confirmed.event';
import { OrderItemCreatedEvent } from './events/order-item-created.event';
import type { OrderItemEventPayload } from './events/order-item-event-payload';
import { OrderItemRefundedEvent } from './events/order-item-refunded.event';
import { OrderItemReturnedEvent } from './events/order-item-returned.event';
import { OrderItemUpdatedEvent } from './events/order-item-updated.event';
import { StatusVo } from './value-objects/status.vo';
import type { OrderItemFailureReason } from './value-objects/failure-reason';

export type createOrderProps = {
  id: Id;
  orderId: Id;
  vendorId: Id;
  productId: Id;
  variantId: Id;
  quantity: Quantity;
  waitingTime: ExpirationDate;
  price: Money;
};

export class OrderItemsAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _orderId: Id,
    private readonly _vendorId: Id,
    private readonly _productId: Id,
    private readonly _variantId: Id,
    private _quantity: Quantity,
    private _waitingTime: ExpirationDate,
    private _status: StatusVo,
    private _totalPrice: Money,
    private _price: Money,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();
  }

  get id() {
    return this._id;
  }
  get orderId() {
    return this._orderId;
  }
  get vendorId() {
    return this._vendorId;
  }
  get productId() {
    return this._productId;
  }
  get variantId() {
    return this._variantId;
  }
  get quantity() {
    return this._quantity;
  }
  get waitingTime() {
    return this._waitingTime;
  }
  get status() {
    return this._status;
  }
  get totalPrice() {
    return this._totalPrice;
  }
  get price() {
    return this._price;
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

  /** Snapshot used by every lifecycle event so payloads stay consistent. */
  private eventPayload(): OrderItemEventPayload {
    return {
      orderItemId: this._id,
      orderId: this._orderId,
      vendorId: this._vendorId,
      productId: this._productId,
      variantId: this._variantId,
      quantity: this._quantity,
      price: this._price,
      totalPrice: this._totalPrice,
    };
  }

  static create(props: createOrderProps): OrderItemsAggregate {
    const totalPrice = Money.create(props.quantity.value * props.price.value);
    const orderItem = new OrderItemsAggregate(
      props.id,
      props.orderId,
      props.vendorId,
      props.productId,
      props.variantId,
      props.quantity,
      props.waitingTime,
      StatusVo.pending(),
      totalPrice,
      props.price,
      DeleteInfoVO.none(),
      Quantity.create(1),
      EffectiveDate.today(),
    );
    orderItem.raise(new OrderItemCreatedEvent(orderItem.eventPayload()));

    return orderItem;
  }

  static rehydrate(
    _id: Id,
    _orderId: Id,
    _vendorId: Id,
    _productId: Id,
    _variantId: Id,
    _quantity: Quantity,
    _waitingTime: ExpirationDate,
    _status: StatusVo,
    _totalPrice: Money,
    _price: Money,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ) {
    return new OrderItemsAggregate(
      _id,
      _orderId,
      _vendorId,
      _productId,
      _variantId,
      _quantity,
      _waitingTime,
      _status,
      _totalPrice,
      _price,
      _delete,
      _version,
      _createdAt,
    );
  }

  /**
   * Turns a previously rejected cart line back into a real order item.
   *
   * The rules are domain rules: the stored line must still be `failed` and must
   * carry a failure reason, the status may only go `failed -> pending`
   * (enforced by `StatusVo.restore`), and the restored line needs a real price.
   */
  static restoreFromFailure(props: {
    id: Id;
    orderId: Id;
    variantId: Id;
    quantity: Quantity;
    waitingTime: ExpirationDate;
    status: string;
    failureReason: OrderItemFailureReason | null;
    productId: Id;
    vendorId: Id;
    price: Money;
    version: Quantity;
    createdAt: EffectiveDate;
  }): OrderItemsAggregate {
    if (!props.failureReason) {
      throw new BadRequestError('Only a failed order item can be restored.');
    }
    // Throws unless the stored status is `failed`.
    StatusVo.fromString(props.status).restore();

    const orderItem = new OrderItemsAggregate(
      props.id,
      props.orderId,
      props.vendorId,
      props.productId,
      props.variantId,
      props.quantity,
      props.waitingTime,
      StatusVo.pending(),
      Money.create(props.quantity.value * props.price.value),
      props.price,
      DeleteInfoVO.none(),
      props.version,
      props.createdAt,
    );
    orderItem.raise(
      new OrderItemUpdatedEvent({
        orderItemId: orderItem._id,
        orderId: orderItem._orderId,
        quantity: orderItem._quantity,
        waitingTime: orderItem._waitingTime,
        price: orderItem._price,
        totalPrice: orderItem._totalPrice,
      }),
    );

    return orderItem;
  }

  confirm() {
    this._status = this._status.confirm();
    this.raise(new OrderItemConfirmedEvent(this.eventPayload()));
    return this;
  }

  complete() {
    this._status = this._status.complete();
    this.raise(new OrderItemCompletedEvent(this.eventPayload()));
    return this;
  }

  cancel() {
    this._status = this._status.cancel();
    this.raise(new OrderItemCancelledEvent(this.eventPayload()));
    return this;
  }

  /** `return` is reserved in TS, so the method is named `returnItem`. */
  returnItem() {
    this._status = this._status.return();
    this.raise(new OrderItemReturnedEvent(this.eventPayload()));
    return this;
  }

  refund() {
    this._status = this._status.refund();
    this.raise(new OrderItemRefundedEvent(this.eventPayload()));
    return this;
  }

  update(data: {
    quantity: Quantity;
    waitingTime: ExpirationDate;
    price: Money;
  }) {
    this._quantity = data.quantity;
    this._waitingTime = data.waitingTime;
    this._price = data.price;
    this._totalPrice = Money.create(data.quantity.value * data.price.value);
    this.raise(
      new OrderItemUpdatedEvent({
        orderItemId: this._id,
        orderId: this._orderId,
        quantity: this._quantity,
        waitingTime: this._waitingTime,
        price: this._price,
        totalPrice: this._totalPrice,
      }),
    );
    return this;
  }
}
