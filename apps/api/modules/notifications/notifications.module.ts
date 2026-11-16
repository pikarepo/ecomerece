import type {
  IOrderQueries,
  IReturnQueries,
  IShipmentQueries,
  IUserQueries,
} from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { OrderNotificationHandler } from './application/event-handlers/order-notification.handler';
import { ReturnNotificationHandler } from './application/event-handlers/return-notification.handler';
import { ShipmentNotificationHandler } from './application/event-handlers/shipment-notification.handler';
import { NotificationDispatcher } from './application/notification.dispatcher';
import { NotificationsApplicationService } from './application/notifications.app.service';
import { NotificationsInternalService } from './application/notifications.internal.service';
import { createNotificationChannels } from './infrastructure/notification-channels.factory';
import { NotificationRepository } from './infrastructure/notification.repository';
import { loadNotificationsConfig } from './notifications.config';
import { NotificationsController } from './presentation/notifications.controller';

interface NotificationsModuleDeps extends Buses {
  orderQueries: IOrderQueries;
  shipmentQueries: IShipmentQueries;
  returnQueries: IReturnQueries;
  userQueries: IUserQueries;
}

export function createNotificationsModule({
  eventBus,
  orderQueries,
  shipmentQueries,
  returnQueries,
  userQueries,
}: NotificationsModuleDeps) {
  const notificationRepo = new NotificationRepository();
  const internalService = new NotificationsInternalService(notificationRepo);
  // Channels come from env (NOTIFICATION_CHANNELS); the inbox is always written.
  const dispatcher = new NotificationDispatcher(
    createNotificationChannels(loadNotificationsConfig()),
    userQueries,
  );
  const appService = new NotificationsApplicationService(
    notificationRepo,
    internalService,
    eventBus,
    dispatcher,
  );
  const controller = new NotificationsController(appService);

  // Reactions only: the module subscribes to other modules' events and never
  // writes into them, so the dependency graph stays acyclic.
  const orderHandler = new OrderNotificationHandler(appService, orderQueries);
  eventBus.register('order.created', orderHandler);
  eventBus.register('order.cancelled', orderHandler);

  const shipmentHandler = new ShipmentNotificationHandler(appService, shipmentQueries);
  eventBus.register('shipment.dispatched', shipmentHandler);
  eventBus.register('shipment.delivered', shipmentHandler);
  eventBus.register('shipment.failed', shipmentHandler);

  const returnHandler = new ReturnNotificationHandler(appService, returnQueries);
  eventBus.register('return.approved', returnHandler);
  eventBus.register('return.rejected', returnHandler);
  eventBus.register('return.received', returnHandler);

  return { controller };
}
