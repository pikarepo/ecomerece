import { BadRequestError } from '../../../errors/app-error';
import { StringVO } from '../../../value-objects';

export const NotificationTypeEnum = {
  ORDER: 'order',
  SHIPMENT: 'shipment',
  RETURN: 'return',
  ACCOUNT: 'account',
  SYSTEM: 'system',
} as const;

export type NotificationTypeValue =
  (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum];

export class NotificationTypeVO extends StringVO {
  private constructor(value: NotificationTypeValue) {
    super(value);

    if (!Object.values(NotificationTypeEnum).includes(this.value as NotificationTypeValue)) {
      throw new BadRequestError(`Invalid notification type: "${this.value}"`);
    }
  }

  static create(value: string): NotificationTypeVO {
    if (!Object.values(NotificationTypeEnum).includes(value as NotificationTypeValue)) {
      throw new BadRequestError(`Invalid notification type: "${value}"`);
    }
    return new NotificationTypeVO(value as NotificationTypeValue);
  }

  static rehydrate(value: string): NotificationTypeVO {
    return NotificationTypeVO.create(value);
  }
}
