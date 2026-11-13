import type { IOrderQueries, IProductQueries, IVendorQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { ReviewApplicationService } from './application/review.app.service';
import { ReviewRepository } from './infrastructure/review.repository';
import { ReviewController } from './presentation/review.controller';

interface ReviewModuleDeps extends Buses {
  orderQueries: IOrderQueries;
  productQueries: IProductQueries;
  vendorQueries: IVendorQueries;
}

export function createReviewModule({
  eventBus,
  orderQueries,
  productQueries,
  vendorQueries,
}: ReviewModuleDeps) {
  const reviewRepo = new ReviewRepository();
  const applicationService = new ReviewApplicationService(
    orderQueries,
    productQueries,
    vendorQueries,
    reviewRepo,
    eventBus,
  );
  const controller = new ReviewController(applicationService);
  return { reviewRepo, applicationService, controller };
}
