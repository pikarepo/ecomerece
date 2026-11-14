import type { AuthActor, IOrderWriter } from '@ecomerece/contracts';
import { CartAggregate } from '@ecomerece/domain';
import type { IEvent, IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import type { addCartItemDtoType, checkoutCartDtoType, deleteCartDtoType } from '@ecomerece/shared';
import { BaseService } from '../../../core/services/base.services';
import { CartMapper } from '../infrastructure/cart.mapper';
import type { CartRepository } from '../infrastructure/cart.repository';
import { CartMessages } from '../presentation/cart.messages';

/**
 * Cart use cases.
 *
 * The cart is permanent and system-owned: it is provisioned when the user
 * account signs up (`user.signed-in` handler), can be re-provisioned through
 * `POST /cart/init` when that event was missed, and can only be deleted by an
 * admin. There is no buyer-facing delete.
 *
 * Checkout is the only cross-module write: the cart sends the selected lines to
 * the order module through `IOrderWriter`, which prices them, reserves stock
 * and creates exactly one order for all of them — with every vendor in
 * `vendorIds` — instead of one order per vendor.
 *
 * The order is created (and its events published) before the cart is touched:
 * the order module owns that transaction, and nesting it inside a cart one
 * would publish order events before the outer commit. If the cart save then
 * fails the lines stay in the cart, so a retry can never lose a purchase.
 */
export class CartApplicationService extends BaseService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly orderWriter: IOrderWriter,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  /** The buyer's cart, or null while it has not been provisioned. */
  async getMyCart(actor: AuthActor) {
    const cart = await this.cartRepo.FindByBuyerId(Id.create(actor._id));
    return cart ? CartMapper.aggregateToResponseReadModel(cart) : null;
  }

  /**
   * Idempotent provisioning, used by the `user.signed-in` handler and by
   * `POST /cart/init` as the fallback when the event never arrived.
   */
  async provisionForBuyer(buyerId: Id): Promise<void> {
    const existing = await this.cartRepo.FindByBuyerId(buyerId);
    if (existing) return;

    const cart = CartAggregate.create({ id: Id.create(), buyerId });
    await this.cartRepo.Create(cart);
    await this.publish(cart.pullEvents());
  }

  /** Explicit cart creation button: same provisioning, returned to the client. */
  async initMyCart(actor: AuthActor) {
    const buyerId = Id.create(actor._id);
    await this.provisionForBuyer(buyerId);

    const cart = await this.cartRepo.FindByBuyerIdOrThrow(buyerId);
    return CartMessages.cartInitialized(cart, buyerId);
  }

  async addItem(data: addCartItemDtoType, actor: AuthActor) {
    const buyerId = Id.create(actor._id);
    const cart = await this.cartRepo.FindByBuyerIdOrThrow(buyerId);

    const item = cart.addItem(Id.create(data.variantId), Quantity.create(data.quantity), buyerId);
    await this.cartRepo.Save(cart);
    await this.publish(cart.pullEvents());

    return CartMessages.itemAdded(cart, buyerId, item.id);
  }

  /**
   * Orders the selected cart lines.
   *
   * All-or-nothing: the order module throws when any selected line cannot be
   * bought, and nothing has been removed from the cart at that point, so the
   * buyer simply still has their lines.
   */
  async checkoutItems(data: checkoutCartDtoType, actor: AuthActor) {
    const buyerId = Id.create(actor._id);
    const cartItemIds = data.cartItemIds.map((cartItemId) => Id.create(cartItemId));

    const cart = await this.cartRepo.FindByBuyerIdOrThrow(buyerId);
    const selected = cart.selectItems(cartItemIds);

    const order = await this.orderWriter.createFromCart({
      idempotentKey: Id.create(data.idempotentKey),
      buyerId,
      addressId: Id.create(data.addressId),
      waitingTime: ExpirationDate.create(data.waitingTime),
      items: selected.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    });

    cart.checkoutSelected(cartItemIds, order.orderId, buyerId);
    await this.cartRepo.Save(cart);
    await this.publish(cart.pullEvents());

    return CartMessages.checkedOut(cart, buyerId, order);
  }

  /** Admin: soft-delete a cart, with the reason kept on the deletion info. */
  async deleteCart(id: string, data: deleteCartDtoType, actor: AuthActor) {
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const cart = await this.cartRepo.FindByIdOrThrow(Id.create(id));

    cart.deleteCart(reason, actorId);
    await this.cartRepo.Save(cart);
    await this.publish(cart.pullEvents());

    return CartMessages.cartDeleted(cart, actorId, reason);
  }

  private async publish(events: IEvent[]): Promise<void> {
    if (events.length > 0) await this.eventBus.publish(events);
  }
}
