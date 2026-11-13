import type { IProductStockUpdater } from '@ecomerece/contracts';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ProductRepository } from './product.repository';

export class ProductStockAdapter implements IProductStockUpdater {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async setInStock(
    productId: Id,
    inStock: boolean,
    actorId: Id,
    options?: { publish?: boolean },
  ): Promise<{ ok: boolean }> {
    const product = await this.productRepo.FindById(productId);
    if (!product) return { ok: false };
    if (product.inStock === inStock) return { ok: true };
    product.setInStock(inStock, actorId);
    await this.productRepo.Save(product);
    const events = product.pullEvents();
    if (options?.publish !== false && events.length > 0) {
      await this.eventBus.publish(events);
    }
    return { ok: true };
  }
}
