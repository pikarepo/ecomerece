import type { Buses } from '../../core/infrastructure/buses/buses';
import { GetAdminPaginatedReviewsQuery } from './application/queries/get-admin-paginated-reviews.query';
import { GetPaginatedReviewsQuery } from './application/queries/get-paginated-reviews.query';
import { GetReviewByIdQuery } from './application/queries/get-review-by-id.query';
import { GetReviewsByProductIdQuery } from './application/queries/get-reviews-by-product-id.query';
import { GetAdminPaginatedReviewsHandler } from './application/query-handlers/get-admin-paginated-reviews.query-handler';
import { GetPaginatedReviewsHandler } from './application/query-handlers/get-paginated-reviews.query-handler';
import { GetReviewByIdHandler } from './application/query-handlers/get-review-by-id.query-handler';
import { GetReviewsByProductIdHandler } from './application/query-handlers/get-reviews-by-product-id.query-handler';
import { ReviewApplicationService } from './application/review.app.service';
import { ReviewRepository } from './infrastructure/review.repository';
import { ReviewController } from './presentation/review.controller';

export function createReviewModule({ queryBus, eventBus }: Buses) {
  const reviewRepo = new ReviewRepository();
  const applicationService = new ReviewApplicationService(queryBus, reviewRepo, eventBus);
  queryBus.register(GetReviewByIdQuery, new GetReviewByIdHandler(applicationService));
  queryBus.register(
    GetReviewsByProductIdQuery,
    new GetReviewsByProductIdHandler(applicationService),
  );
  queryBus.register(
    GetPaginatedReviewsQuery,
    new GetPaginatedReviewsHandler(applicationService),
  );
  queryBus.register(
    GetAdminPaginatedReviewsQuery,
    new GetAdminPaginatedReviewsHandler(applicationService),
  );
  const controller = new ReviewController(applicationService);
  return { reviewRepo, applicationService, controller };
}
