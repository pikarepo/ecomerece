import type { IOrderItemsQueries, IPayoutQueries, IVendorQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { PayoutsApplicationService } from './application/payouts.app.service';
import { LedgerRepository, PayoutRepository } from './infrastructure/payout.repository';
import { PayoutsController } from './presentation/payouts.controller';

interface PayoutsModuleDeps extends Buses {
  vendorQueries: IVendorQueries;
  orderItemsQueries: IOrderItemsQueries;
}

class PayoutPaymentEventHandler {
  constructor(
    private readonly service: PayoutsApplicationService,
    private readonly kind: 'captured' | 'refunded',
  ) {}
  async handle(event: any) {
    if (this.kind === 'captured') await this.service.handlePaymentCaptured(event);
    else await this.service.handlePaymentRefunded(event);
  }
}

export function createPayoutsModule({
  eventBus,
  vendorQueries,
  orderItemsQueries,
}: PayoutsModuleDeps) {
  const payoutRepo = new PayoutRepository();
  const ledgerRepo = new LedgerRepository();
  const appService = new PayoutsApplicationService(
    payoutRepo,
    ledgerRepo,
    eventBus,
    vendorQueries,
    orderItemsQueries,
  );
  const controller = new PayoutsController(appService);

  eventBus.register(
    'payment.captured',
    new PayoutPaymentEventHandler(appService, 'captured') as any,
  );
  eventBus.register(
    'payment.refunded',
    new PayoutPaymentEventHandler(appService, 'refunded') as any,
  );

  const queries: IPayoutQueries = appService;
  return { controller, queries };
}
