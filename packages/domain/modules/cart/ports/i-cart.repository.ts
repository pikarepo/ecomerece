import type { Id } from '../../../value-objects';
import type { CartAggregate } from '../cart.aggregate';

export interface ICartRepository {
  FindById(id: Id): Promise<CartAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<CartAggregate>;
  /** The buyer's open cart; one cart per buyer. */
  FindByBuyerId(buyerId: Id): Promise<CartAggregate | null>;
  FindByBuyerIdOrThrow(buyerId: Id): Promise<CartAggregate>;
  Create(cart: CartAggregate): Promise<void>;
  Save(cart: CartAggregate): Promise<void>;
}
