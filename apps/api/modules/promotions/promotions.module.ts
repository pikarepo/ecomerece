import type { Buses } from '../../core/infrastructure/buses/buses';
import { CouponQueryAdapter, CouponWriterAdapter } from './application/coupon-adapters';
import { PromotionsApplicationService } from './application/promotions.app.service';
import { PromotionsInternalService } from './application/promotions.internal.service';
import { CouponRepository } from './infrastructure/coupon.repository';
import { PromotionsController } from './presentation/promotions.controller';

export function createPromotionsModule({ eventBus }: Buses) {
  const couponRepo = new CouponRepository();
  const internalService = new PromotionsInternalService(couponRepo);
  const appService = new PromotionsApplicationService(couponRepo, internalService, eventBus);
  const controller = new PromotionsController(appService);

  return {
    controller,
    queries: new CouponQueryAdapter(appService),
    writer: new CouponWriterAdapter(appService),
  };
}
