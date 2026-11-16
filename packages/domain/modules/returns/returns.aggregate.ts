import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import { ReturnApprovedEvent } from './events/return-approved.event';
import { ReturnCancelledEvent } from './events/return-cancelled.event';
import { ReturnReceivedEvent } from './events/return-received.event';
import { ReturnRejectedEvent } from './events/return-rejected.event';
import { ReturnRequestedEvent } from './events/return-requested.event';
import { ReturnShippedBackEvent } from './events/return-shipped-back.event';
import { ReturnStatusVO } from './value-objects/return-status.vo';
import type { ReturnTypeVO } from './value-objects/return-type.vo';

export type CreateReturnProps = {
  id: Id;
  orderId: Id;
  orderItemId: Id;
  vendorId: Id;
  buyerId: Id;
  quantity: Quantity;
  returnType: ReturnTypeVO;
  reason: Reason;
};

/**
 * One return request for one order line. Quantity is capped by the app service
 * against the ordered quantity minus whatever is already out on return, so the
 * aggregate only has to guarantee that it describes a positive quantity and a
 * legal transition.
 */
export class ReturnRequestAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _orderId: Id,
    private readonly _orderItemId: Id,
    private readonly _vendorId: Id,
    private readonly _buyerId: Id,
    private readonly _quantity: Quantity,
    private readonly _returnType: ReturnTypeVO,
    private readonly _reason: Reason,
    private _status: ReturnStatusVO,
    private _decisionReason: Reason | null,
    private readonly _requestedAt: EffectiveDate,
    private _decidedAt: EffectiveDate | null,
    private _receivedAt: EffectiveDate | null,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();

    if (_quantity.value < 1) {
      throw new BadRequestError('A return request must cover at least one unit.');
    }
  }

  get id() {
    return this._id;
  }
  get orderId() {
    return this._orderId;
  }
  get orderItemId() {
    return this._orderItemId;
  }
  get vendorId() {
    return this._vendorId;
  }
  get buyerId() {
    return this._buyerId;
  }
  get quantity() {
    return this._quantity;
  }
  get returnType() {
    return this._returnType;
  }
  get reason() {
    return this._reason;
  }
  get status() {
    return this._status;
  }
  get decisionReason() {
    return this._decisionReason;
  }
  get requestedAt() {
    return this._requestedAt;
  }
  get decidedAt() {
    return this._decidedAt;
  }
  get receivedAt() {
    return this._receivedAt;
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

  static create(data: CreateReturnProps): ReturnRequestAggregate {
    return new ReturnRequestAggregate(
      data.id,
      data.orderId,
      data.orderItemId,
      data.vendorId,
      data.buyerId,
      data.quantity,
      data.returnType,
      data.reason,
      ReturnStatusVO.requested(),
      null,
      EffectiveDate.today(),
      null,
      null,
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    _id: Id,
    _orderId: Id,
    _orderItemId: Id,
    _vendorId: Id,
    _buyerId: Id,
    _quantity: Quantity,
    _returnType: ReturnTypeVO,
    _reason: Reason,
    _status: ReturnStatusVO,
    _decisionReason: Reason | null,
    _requestedAt: EffectiveDate,
    _decidedAt: EffectiveDate | null,
    _receivedAt: EffectiveDate | null,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): ReturnRequestAggregate {
    return new ReturnRequestAggregate(
      _id,
      _orderId,
      _orderItemId,
      _vendorId,
      _buyerId,
      _quantity,
      _returnType,
      _reason,
      _status,
      _decisionReason,
      _requestedAt,
      _decidedAt,
      _receivedAt,
      _delete,
      _version,
      _createdAt,
    );
  }

  /** The buyer is the actor of a request, so it needs no separate argument. */
  requestReturn() {
    this.raise(
      new ReturnRequestedEvent({
        returnId: this._id,
        orderId: this._orderId,
        orderItemId: this._orderItemId,
        buyerId: this._buyerId,
      }),
    );
  }

  approve(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.approve();
    this._decidedAt = EffectiveDate.today();
    this.raise(new ReturnApprovedEvent({ returnId: this._id, actorId }));
  }

  reject(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.reject();
    this._decisionReason = reason;
    this._decidedAt = EffectiveDate.today();
    this.raise(new ReturnRejectedEvent({ returnId: this._id, reason, actorId }));
  }

  markShippedBack(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markShippedBack();
    this.raise(new ReturnShippedBackEvent({ returnId: this._id, actorId }));
  }

  markReceived(actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.markReceived();
    this._receivedAt = EffectiveDate.today();
    this.raise(
      new ReturnReceivedEvent({
        returnId: this._id,
        orderId: this._orderId,
        orderItemId: this._orderItemId,
        actorId,
      }),
    );
  }

  cancel(reason: Reason, actorId: Id) {
    this.ensureNotDeleted();
    this._status = this._status.cancel();
    this._decisionReason = reason;
    this.raise(new ReturnCancelledEvent({ returnId: this._id, reason, actorId }));
  }

  deleteRequest(reason: Reason, actorId: Id) {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Return request is already deleted.');
    }
    if (!this._status.isFinal) {
      throw new BadRequestError('Only a closed return request can be deleted.');
    }

    this._delete = DeleteInfoVO.create(actorId, reason);
    this.raise(new ReturnCancelledEvent({ returnId: this._id, reason, actorId }));
  }

  recoverRequest() {
    if (!this._delete.isDeleted) {
      throw new BadRequestError('Return request is not deleted.');
    }
    this._delete = DeleteInfoVO.none();
  }

  ensureOwnedByVendor(vendorId: Id): void {
    if (!this._vendorId.equals(vendorId)) {
      throw new BadRequestError('You do not own this return request.');
    }
  }

  isOwnedByBuyer(buyerId: Id): boolean {
    return this._buyerId.equals(buyerId);
  }

  private ensureNotDeleted(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Cannot perform operation on a deleted return request.');
    }
  }
}
