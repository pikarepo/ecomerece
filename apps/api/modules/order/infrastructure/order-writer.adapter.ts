import type {
  AuthActor,
  CartOrderResult,
  CreateCartOrderInput,
  IOrderWriter,
} from '@ecomerece/contracts';
import type { Id, Reason } from '@ecomerece/domain';
import type { OrderApplicationService } from '../application/order.app.service';

export class OrderWriterAdapter implements IOrderWriter {
  constructor(private readonly service: OrderApplicationService) {}

  createFromCart(input: CreateCartOrderInput): Promise<CartOrderResult> {
    return this.service.createFromCart(input);
  }

  async returnOrder(orderId: Id, reason: Reason, actor: AuthActor): Promise<void> {
    await this.service.returnOrder(orderId.value, { reason: reason.value }, actor);
  }

  async refundOrder(orderId: Id, reason: Reason, actor: AuthActor): Promise<void> {
    await this.service.refundOrder(orderId.value, { reason: reason.value }, actor);
  }
}
