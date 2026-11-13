import type { Buses } from '../../core/infrastructure/buses/buses';
import { UserSignedInHandler } from './application/event-handlers/user-signed-in.handler';
import { VendorDeletedHandler } from './application/event-handlers/vendor-deleted.handler';
import { VendorRejectedHandler } from './application/event-handlers/vendor-rejected.handler';
import { VendorVerifiedHandler } from './application/event-handlers/vendor-verified.handler';
import { UserAppService } from './application/user.app.service';
import { UserInternalService } from './application/user.internal.service';
import { UserQueryAdapter } from './infrastructure/user-query.adapter';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './presentation/user.controller';

export function createUserModule({ eventBus }: Buses) {
  const userRepo = new UserRepository();

  const internalSvc = new UserInternalService(userRepo, eventBus);
  const appSvc = new UserAppService(userRepo, eventBus);
  const userController = new UserController(appSvc);
  const queries = new UserQueryAdapter(internalSvc);

  eventBus.register('user.signed-in', new UserSignedInHandler());
  eventBus.register('vendor.verified', new VendorVerifiedHandler(internalSvc));
  eventBus.register('vendor.deleted', new VendorDeletedHandler(internalSvc));
  eventBus.register('vendor.rejected', new VendorRejectedHandler(internalSvc));

  return {
    userController,
    appSvc,
    internalSvc,
    queries,
  };
}
