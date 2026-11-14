import type { CartAggregate, ICartRepository } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { BadRequestError, ConcurrencyError } from '../../../errors/app-error';
import { CartMapper } from './cart.mapper';
import { CartModel, type CartPersistence } from './cart.model';

export class CartRepository extends MongoRepository<CartPersistence> implements ICartRepository {
  constructor() {
    super(CartModel);
  }

  async FindById(id: Id): Promise<CartAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc || doc.deleted.deleted) return null;
    return CartMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<CartAggregate> {
    const doc = await super.findById(id.value);
    if (!doc || doc.deleted.deleted) throw new BadRequestError('Cart not found.');
    return CartMapper.persistenceToAggregate(doc);
  }

  async FindByBuyerId(buyerId: Id): Promise<CartAggregate | null> {
    const doc = await super.findOne({ buyerId: buyerId.value, 'deleted.deleted': false });
    if (!doc) return null;
    return CartMapper.persistenceToAggregate(doc);
  }

  async FindByBuyerIdOrThrow(buyerId: Id): Promise<CartAggregate> {
    const cart = await this.FindByBuyerId(buyerId);
    if (!cart) throw new BadRequestError('Cart not found.');
    return cart;
  }

  async Create(cart: CartAggregate): Promise<void> {
    await super.create(new CartModel(CartMapper.aggregateToPersistence(cart)));
  }

  async Save(cart: CartAggregate): Promise<void> {
    const data = CartMapper.aggregateToPersistence(cart);

    const result = await super.updateOne(
      {
        _id: cart.id.value,
        version: cart.version.value,
      },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }
}
