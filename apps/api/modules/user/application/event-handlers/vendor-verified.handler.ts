import type { VendorVerifiedEvent } from '@ecomerece/domain';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import type { UserInternalService } from '../user.internal.service';

type VendorVerifiedPayload = VendorVerifiedEvent['payload'];

export class VendorVerifiedHandler implements IEventHandler<VendorVerifiedPayload> {
  constructor(private readonly internalSvc: UserInternalService) {}

  async handle(event: IEvent<VendorVerifiedPayload>): Promise<void> {
    await this.internalSvc.promoteToVendor(event.payload.ownerId);
  }
}
