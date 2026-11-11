import type { Buses } from '../../core/infrastructure/buses/buses';
import { UserSignedInHandler } from './application/event-handlers/user-signed-in.handler';
import { VendorDeletedHandler } from './application/event-handlers/vendor-deleted.handler';
import { VendorRejectedHandler } from './application/event-handlers/vendor-rejected.handler';
import { VendorVerifiedHandler } from './application/event-handlers/vendor-verified.handler';
import { EnsureActiveQuery } from './application/queries/ensure-active.query';
import { EnsureActiveUserGetByIdQuery } from './application/queries/ensure-active-user-get-by-id.query';
import { GetAdminPaginatedUsersQuery } from './application/queries/get-admin-paginated-users.query';
import { GetPaginatedUsersQuery } from './application/queries/get-paginated-users.query';
import { GetUserByEmailQuery } from './application/queries/get-user-by-email.query';
import { GetUserByIdQuery } from './application/queries/get-user-by-id.query';
import { VerifyUserAndGetQuery } from './application/queries/verify-user-and-get.query';
import { EnsureActiveHandler } from './application/query-handlers/ensure-active.handler';
import { EnsureActiveUserGetByIdHandler } from './application/query-handlers/ensure-active-user-get-by-id.handler';
import { GetAdminPaginatedUsersHandler } from './application/query-handlers/get-admin-paginated-users.query-handler';
import { GetPaginatedUsersHandler } from './application/query-handlers/get-paginated-users.query-handler';
import { GetUserByEmailHandler } from './application/query-handlers/get-user-by-email.query-handler';
import { GetUserByIdHandler } from './application/query-handlers/get-user-by-id.handler';
import { VerifyUserAndGetHandler } from './application/query-handlers/verify-user-and-get.query-handler';
import { UserAppService } from './application/user.app.service';
import { UserInternalService } from './application/user.internal.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './presentation/user.controller';

export function createUserModule({ queryBus, eventBus }: Buses) {
  const userRepo = new UserRepository();

  const internalSvc = new UserInternalService(userRepo, eventBus);
  const appSvc = new UserAppService(userRepo, eventBus);
  const userController = new UserController(appSvc);

  eventBus.register('user.signed-in', new UserSignedInHandler());
  eventBus.register('vendor.verified', new VendorVerifiedHandler(internalSvc));
  eventBus.register('vendor.deleted', new VendorDeletedHandler(internalSvc));
  eventBus.register('vendor.rejected', new VendorRejectedHandler(internalSvc));
  queryBus.register(GetUserByIdQuery, new GetUserByIdHandler(internalSvc));
  queryBus.register(EnsureActiveQuery, new EnsureActiveHandler(internalSvc));
  queryBus.register(EnsureActiveUserGetByIdQuery, new EnsureActiveUserGetByIdHandler(internalSvc));
  queryBus.register(VerifyUserAndGetQuery, new VerifyUserAndGetHandler(internalSvc));
  queryBus.register(GetUserByEmailQuery, new GetUserByEmailHandler(internalSvc));
  queryBus.register(GetPaginatedUsersQuery, new GetPaginatedUsersHandler(appSvc));
  queryBus.register(
    GetAdminPaginatedUsersQuery,
    new GetAdminPaginatedUsersHandler(appSvc),
  );

  return {
    userController,
    appSvc,
    internalSvc,

    queries: {
      GetUserByIdQuery,
      EnsureActiveQuery,
    },
  };
}
