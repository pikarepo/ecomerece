import type { ICommand } from '@ecomerece/domain/command/i-command-bus';
import type { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

export class CreateItemsCommand implements ICommand<{}> {
  constructor(
    public readonly items: {
      id: Id;
      orderId: Id;
      vendorId: Id;
      productId: Id;
      variantId: Id;
      quantity: Quantity;
      waitingTime: ExpirationDate;
      price: Money;
    }[],
  ) {}
}
