import type { VendorVerificationRejectedEvent } from '@ecomerece/domain';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import type { UserInternalService } from '../user.internal.service';

type VendorRejectedPayload = VendorVerificationRejectedEvent['payload'];

export class VendorRejectedHandler implements IEventHandler<VendorRejectedPayload> {
  constructor(private readonly internalSvc: UserInternalService) {}

  async handle(event: IEvent<VendorRejectedPayload>): Promise<void> {
    await this.internalSvc.demoteToCustomer(event.payload.ownerId);
  }
}
