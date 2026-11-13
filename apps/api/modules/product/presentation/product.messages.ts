import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { Reason } from '@ecomerece/domain/value-objects/reason.vo';
export type productMessagesType = {
  message: string;
};
export const productMessages = {
  productCreated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was created by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  productUpdated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  productDeleted(productId: Id, actorId: Id, reason: Reason): productMessagesType {
    return {
      message: `Product ${productId.value} was deleted by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  productBlocked(productId: Id, actorId: Id, reason: Reason): productMessagesType {
    return {
      message: `Product ${productId.value} was blocked by ${actorId.value} on ${EffectiveDate.today().value}. Reason: ${reason.value}.`,
    };
  },
  productUnBlocked(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was unblocked by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  productRecovered(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was recovered by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  productPublic(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was made public by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  productPrivate(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Product ${productId.value} was made private by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  metaUpdated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The metadata for product ${productId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  disclaimerEnabled(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The disclaimer for product ${productId.value} was enabled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  disclaimerDisabled(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The disclaimer for product ${productId.value} was disabled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  disclaimerUpdated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The disclaimer for product ${productId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  imageUpdated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The images for product ${productId.value} were updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  imageDefault(index: Quantity, productId: Id, actorId: Id): productMessagesType {
    return {
      message: `Image #${index.increase(1).value} was set as the default image for product ${productId.value} by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  ingredientsEnabled(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The ingredients list for product ${productId.value} was enabled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  ingredientsDisabled(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The ingredients list for product ${productId.value} was disabled by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  stockUpdated(productId: Id, actorId: Id, inStock: boolean): productMessagesType {
    return {
      message: `Product ${productId.value} stock status was set to ${inStock ? 'in stock' : 'out of stock'} by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
  ingredientsUpdated(productId: Id, actorId: Id): productMessagesType {
    return {
      message: `The ingredients list for product ${productId.value} was updated by ${actorId.value} on ${EffectiveDate.today().value}.`,
    };
  },
};
