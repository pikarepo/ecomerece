
import { AggregateRoot } from '../../aggregate-root';
import {
  DeleteInfoVO,
  EffectiveDate,
  type FullAddressVO,
  type Id,
  type Money,
  Quantity,
} from '../../value-objects';
import { OrderCreatedEvent } from './events/order-created.event';
import type { OrderItem } from './value-objects/order-item.vo';

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
      _delete,
      _version,
      _createdAt,
    );
  }
  createOrder() {
    this.raise(new OrderCreatedEvent({ orderId: this.id, actorId: this.buyerId }));
  }
}
