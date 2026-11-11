import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { EnsureActiveVendorQuery } from './application/queries/ensure-active-vendor.query';
import { EnsureActiveVendorGetByIdQuery } from './application/queries/ensure-active-vendor-get-by-id.query';
import { GetAdminPaginatedVendorsQuery } from './application/queries/get-admin-paginated-vendors.query';
import { GetMyVendorQuery } from './application/queries/get-my-vendor.query';
import { GetPaginatedVendorsQuery } from './application/queries/get-paginated-vendors.query';
import { GetVendorByIdQuery } from './application/queries/get-vendor-by-id.query';
import { GetVendorByUserIdQuery } from './application/queries/get-vendor-by-user-id.query';
import { VerifyVendorAndGetQuery } from './application/queries/verify-vendor-and-get.query';
import { EnsureActiveVendorHandler } from './application/query-handlers/ensure-active-vendor.query-handler';
import { EnsureActiveVendorGetByIdHandler } from './application/query-handlers/ensure-active-vendor-get-by-id.query-handler';
import { GetAdminPaginatedVendorsHandler } from './application/query-handlers/get-admin-paginated-vendors.query-handler';
import { GetMyVendorHandler } from './application/query-handlers/get-my-vendor.query-handler';
import { GetPaginatedVendorsHandler } from './application/query-handlers/get-paginated-vendors.query-handler';
import { GetVendorByIdHandler } from './application/query-handlers/get-vendor-by-id.query-handler';
import { GetVendorByUserIdHandler } from './application/query-handlers/get-vendor-by-user-id.query-handler';
import { VerifyVendorAndGetHandler } from './application/query-handlers/verify-vendor-and-get.query-handler';
import { VendorAppService } from './application/vendor.app.service';
import { VendorInternalService } from './application/vendor.internal.service';
import { VendorStatsAccessAdapter } from './infrastructure/vendor-stats-access.adapter';
import { VendorStatsProjector } from './infrastructure/vendor-stats-projector.adapter';
import { VendorRepository } from './infrastructure/vendor.repository';
import { VendorController } from './presentation/vendor.controller';

interface VendorModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export function CreateVendorModule({ queryBus, eventBus, imageStorage }: VendorModuleDeps) {
  const repo = new VendorRepository();
  const internalService = new VendorInternalService(repo, queryBus);

  queryBus.register(
    EnsureActiveVendorGetByIdQuery,
    new EnsureActiveVendorGetByIdHandler(internalService),
  );
  queryBus.register(VerifyVendorAndGetQuery, new VerifyVendorAndGetHandler(internalService));

  queryBus.register(EnsureActiveVendorQuery, new EnsureActiveVendorHandler(internalService));
  queryBus.register(GetVendorByUserIdQuery, new GetVendorByUserIdHandler(internalService));
  const appService = new VendorAppService(
    repo,
    eventBus,
    internalService,
    imageStorage,
  );
  queryBus.register(GetVendorByIdQuery, new GetVendorByIdHandler(appService));
  queryBus.register(GetMyVendorQuery, new GetMyVendorHandler(appService));
  queryBus.register(GetPaginatedVendorsQuery, new GetPaginatedVendorsHandler(appService));
  queryBus.register(
    GetAdminPaginatedVendorsQuery,
    new GetAdminPaginatedVendorsHandler(appService),
  );
  const vendorController = new VendorController(appService);
  const vendorStats = new VendorStatsProjector();
  const statsAccess = new VendorStatsAccessAdapter(repo);

  return { vendorController, appService, queries: {}, internalService, vendorStats, statsAccess };
}
