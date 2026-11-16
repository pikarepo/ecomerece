import type { Id, Quantity } from '../../../value-objects';
import type { PaymentAggregate } from '../payments.aggregate';

export interface PaymentPaginationFilter {
  orderId?: string;
  buyerId?: string;
  status?: string;
  provider?: string;
  deleted?: boolean;
}

export interface PaymentPage {
  data: PaymentAggregate[];
  meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
}

export interface IPaymentRepository {
  FindById(id: Id): Promise<PaymentAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<PaymentAggregate>;
  FindByOrderId(orderId: Id): Promise<PaymentAggregate[]>;
  FindByProviderRef(providerRef: string): Promise<PaymentAggregate | null>;
  FindPaginated(params: {
    filter?: PaymentPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<PaymentPage>;
  Create(payment: PaymentAggregate): Promise<void>;
  Save(payment: PaymentAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
