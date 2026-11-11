import type { VendorDeletedEvent } from '@ecomerece/domain';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import type { UserInternalService } from '../user.internal.service';

type VendorDeletedPayload = VendorDeletedEvent['payload'];

export class VendorDeletedHandler implements IEventHandler<VendorDeletedPayload> {
  constructor(private readonly internalSvc: UserInternalService) {}

  async handle(event: IEvent<VendorDeletedPayload>): Promise<void> {
    await this.internalSvc.demoteToCustomer(event.payload.ownerId);
  }
}
