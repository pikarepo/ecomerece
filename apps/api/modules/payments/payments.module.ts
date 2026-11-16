import type { IOrderQueries, IPaymentQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { PaymentsApplicationService } from './application/payments.app.service';
import { PaymentsInternalService } from './application/payments.internal.service';
import { PaymentQueryAdapter } from './application/payment-query.adapter';
import { createPaymentGateways } from './infrastructure/payment-gateway.factory';
import { PaymentRepository } from './infrastructure/payment.repository';
import { loadPaymentsConfig } from './payments.config';
import { PaymentsController } from './presentation/payments.controller';

interface PaymentsModuleDeps extends Buses {
  orderQueries: IOrderQueries;
}

export function createPaymentsModule({ eventBus, orderQueries }: PaymentsModuleDeps) {
  const repo = new PaymentRepository();
  const internal = new PaymentsInternalService(repo, orderQueries);
  const gateways = createPaymentGateways(loadPaymentsConfig());
  const appService = new PaymentsApplicationService(repo, internal, eventBus, gateways);
  const controller = new PaymentsController(appService);
  const queries: IPaymentQueries = new PaymentQueryAdapter(internal);
  return { controller, queries };
}
