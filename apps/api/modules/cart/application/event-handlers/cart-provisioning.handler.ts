import type { UserSignedInEvent } from '@ecomerece/domain';
import type { IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import type { CartApplicationService } from '../cart.app.service';

/**
 * Every new account gets its permanent cart as soon as it signs in. The
 * provisioning is idempotent, so later sign-ins are no-ops and a missed event
 * can be repaired either by the next sign-in or by `POST /cart/init`.
 */
export class CartProvisioningHandler implements IEventHandler<UserSignedInEvent['payload']> {
  constructor(private readonly cartService: CartApplicationService) {}

  async handle(event: UserSignedInEvent): Promise<void> {
    await this.cartService.provisionForBuyer(event.payload.userId);
  }
}
