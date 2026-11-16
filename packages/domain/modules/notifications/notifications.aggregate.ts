import { AggregateRoot } from '../../aggregate-root';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, type Id, Quantity, type Reason } from '../../value-objects';
import { NotificationDismissedEvent } from './events/notification-dismissed.event';
import { NotificationCreatedEvent } from './events/notification-created.event';
import { NotificationReadEvent } from './events/notification-read.event';
import type { NotificationTypeVO } from './value-objects/notification-type.vo';

export type CreateNotificationProps = {
  id: Id;
  userId: Id;
  type: NotificationTypeVO;
  title: string;
  body: string;
  referenceId: Id | null;
};

/**
 * One inbox entry for one recipient. Notifications are written by event
 * handlers, never by the recipient, and read state is the only thing they own.
 */
export class NotificationAggregate extends AggregateRoot {
  constructor(
    private readonly _id: Id,
    private readonly _userId: Id,
    private readonly _type: NotificationTypeVO,
    private readonly _title: string,
    private readonly _body: string,
    private readonly _referenceId: Id | null,
    private _isRead: boolean,
    private _readAt: EffectiveDate | null,
    private _delete: DeleteInfoVO,
    private readonly _version: Quantity,
    private readonly _createdAt: EffectiveDate,
  ) {
    super();

    if (_title.trim().length < 3 || _title.length > 120) {
      throw new BadRequestError('Notification title must be 3-120 characters.');
    }
    if (_body.trim().length < 3 || _body.length > 500) {
      throw new BadRequestError('Notification body must be 3-500 characters.');
    }
  }

  get id() {
    return this._id;
  }
  get userId() {
    return this._userId;
  }
  get type() {
    return this._type;
  }
  get title() {
    return this._title;
  }
  get body() {
    return this._body;
  }
  get referenceId() {
    return this._referenceId;
  }
  get isRead() {
    return this._isRead;
  }
  get readAt() {
    return this._readAt;
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

  static create(data: CreateNotificationProps): NotificationAggregate {
    return new NotificationAggregate(
      data.id,
      data.userId,
      data.type,
      data.title,
      data.body,
      data.referenceId,
      false,
      null,
      DeleteInfoVO.none(),
      Quantity.none(),
      EffectiveDate.today(),
    );
  }

  static rehydrate(
    _id: Id,
    _userId: Id,
    _type: NotificationTypeVO,
    _title: string,
    _body: string,
    _referenceId: Id | null,
    _isRead: boolean,
    _readAt: EffectiveDate | null,
    _delete: DeleteInfoVO,
    _version: Quantity,
    _createdAt: EffectiveDate,
  ): NotificationAggregate {
    return new NotificationAggregate(
      _id,
      _userId,
      _type,
      _title,
      _body,
      _referenceId,
      _isRead,
      _readAt,
      _delete,
      _version,
      _createdAt,
    );
  }

  notify() {
    this.raise(
      new NotificationCreatedEvent({
        notificationId: this._id,
        userId: this._userId,
        type: this._type.value,
      }),
    );
  }

  markRead() {
    this.ensureVisible();

    // Opening the same notification twice is normal; the first read wins.
    if (this._isRead) return;

    this._isRead = true;
    this._readAt = EffectiveDate.today();
    this.raise(new NotificationReadEvent({ notificationId: this._id, userId: this._userId }));
  }

  dismiss(reason: Reason) {
    this.ensureVisible();

    this._delete = DeleteInfoVO.create(this._userId, reason);
    this.raise(
      new NotificationDismissedEvent({
        notificationId: this._id,
        userId: this._userId,
        reason,
      }),
    );
  }

  isOwnedBy(userId: Id): boolean {
    return this._userId.equals(userId);
  }

  private ensureVisible(): void {
    if (this._delete.isDeleted) {
      throw new BadRequestError('Notification was already dismissed.');
    }
  }
}
