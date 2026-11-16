import type { IReturnQueries } from '@ecomerece/contracts';
import type { IEvent, IEventHandler } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { NotificationsApplicationService } from '../notifications.app.service';

type ReturnEventPayload = { returnId: Id; reason?: { value: string } };

/** Registered for approved, rejected and received return requests. */
export class ReturnNotificationHandler implements IEventHandler<ReturnEventPayload> {
  constructor(
    private readonly notifications: NotificationsApplicationService,
    private readonly returnQueries: IReturnQueries,
  ) {}

  async handle(event: IEvent<ReturnEventPayload>): Promise<void> {
    const { returnRequest } = await this.returnQueries.ensureActiveById(event.payload.returnId);
    if (!returnRequest) return;

    const copy = this.copyFor(event, returnRequest.decisionReason);

    await this.notifications.createNotification({
      userId: Id.create(returnRequest.buyerId),
      type: 'return',
      title: copy.title,
      body: copy.body,
      referenceId: Id.create(returnRequest.id),
    });
  }

  private copyFor(event: IEvent<ReturnEventPayload>, decisionReason: string | null) {
    if (event.type === 'return.approved') {
      return {
        title: 'Return approved',
        body: 'Your return was approved. Send the item back with the packaging and keep the drop-off receipt.',
      };
    }
    if (event.type === 'return.rejected') {
      return {
        title: 'Return rejected',
        body: `Your return was rejected: ${decisionReason ?? event.payload.reason?.value ?? 'no reason was given'}.`,
      };
    }
    return {
      title: 'Return received',
      body: 'The vendor received your returned item. The refund is processed against the original payment.',
    };
  }
}
