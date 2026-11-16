import { PaymentMapper } from '../infrastructure/payment.mapper';
import type { PaymentAggregate } from '@ecomerece/domain';
import type { PaymentResponseReadModel } from '@ecomerece/shared';

export const PaymentMessages = {
  created(payment: PaymentAggregate) {
    return {
      message: `Payment ${payment.id.value} created.`,
      updatedData: PaymentMapper.aggregateToResponseReadModel(payment),
    };
  },
  updated(payment: PaymentAggregate, action: string) {
    return {
      message: `Payment ${payment.id.value} ${action}.`,
      updatedData: PaymentMapper.aggregateToResponseReadModel(payment) as PaymentResponseReadModel,
    };
  },
};
