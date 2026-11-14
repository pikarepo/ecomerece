import type { IUserQueries } from '@ecomerece/contracts';
import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { VendorAppService } from './application/vendor.app.service';
import { VendorInternalService } from './application/vendor.internal.service';
import { VendorRepository } from './infrastructure/vendor.repository';
import { VendorQueryAdapter } from './infrastructure/vendor-query.adapter';
import { VendorStatsAccessAdapter } from './infrastructure/vendor-stats-access.adapter';
import { VendorStatsProjector } from './infrastructure/vendor-stats-projector.adapter';
import { VendorController } from './presentation/vendor.controller';

interface VendorModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
  userQueries: IUserQueries;
}

export function CreateVendorModule({ eventBus, imageStorage, userQueries }: VendorModuleDeps) {
  const repo = new VendorRepository();
  const internalService = new VendorInternalService(repo, userQueries);
  const appService = new VendorAppService(repo, eventBus, internalService, imageStorage);
  const vendorController = new VendorController(appService);
  const vendorStats = new VendorStatsProjector();
  const statsAccess = new VendorStatsAccessAdapter(repo);
  const queries = new VendorQueryAdapter(internalService);

  return { vendorController, appService, queries, internalService, vendorStats, statsAccess };
}
