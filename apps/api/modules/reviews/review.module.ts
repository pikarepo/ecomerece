import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { queryBus } from '../../core/infrastructure/buses/in-memory-query-bus';
import { ReviewApplicationService } from './application/review.app.service';
import { ReviewRepository } from './infrastructure/review.repository';
import { ReviewController } from './presentation/review.controller';

export function createReviewModule() {
  const reviewRepo = new ReviewRepository();
  const applicationService = new ReviewApplicationService(queryBus, reviewRepo, eventBus);
  const controller = new ReviewController(applicationService);
  return { reviewRepo, applicationService, controller };
}
