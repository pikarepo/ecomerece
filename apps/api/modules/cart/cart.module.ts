import type { IOrderWriter } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { CartApplicationService } from './application/cart.app.service';
import { CartProvisioningHandler } from './application/event-handlers/cart-provisioning.handler';
import { CartRepository } from './infrastructure/cart.repository';
import { CartController } from './presentation/cart.controller';

interface CartModuleDeps extends Buses {
  /** Order write port: one order per checkout, whatever vendors it spans. */
  orderWriter: IOrderWriter;
}

export function createCartModule({ eventBus, orderWriter }: CartModuleDeps) {
  const cartRepo = new CartRepository();
  const cartApplicationService = new CartApplicationService(cartRepo, orderWriter, eventBus);
  const cartController = new CartController(cartApplicationService);

  // One permanent cart per buyer, created when the account signs in.
  eventBus.register('user.signed-in', new CartProvisioningHandler(cartApplicationService));

  return { cartController };
}
