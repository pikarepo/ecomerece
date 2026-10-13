import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Money } from '@ecomerece/domain/value-objects/money.vo';
export type ProductVaraintMessagesType = { message: string };
export const productVaraintMessages = {
  varaintCreated(variantId: Id, productId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `Variant ${variantId.value} was created for product ${productId.value} by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  priceUpdated(
    price: Money,
    discountedPrice: Money,
    actorId: Id,
    variantId: Id,
  ): ProductVaraintMessagesType {
    return {
      message: `The price (${price.value}) and discounted price (${discountedPrice.value}) for variant ${variantId.value} were updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  metaUpdated(variantId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `The metadata for variant ${variantId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  variantDisabled(variantId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `Variant ${variantId.value} was disabled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  variantActivated(variantId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `Variant ${variantId.value} was activated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  variantDeleted(variantId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `Variant ${variantId.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  variantRecovered(variantId: Id, actorId: Id): ProductVaraintMessagesType {
    return {
      message: `Variant ${variantId.value} was recovered by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
