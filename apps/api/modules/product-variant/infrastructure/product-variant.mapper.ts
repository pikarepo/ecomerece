import { ProductVariantAggregate, type ProductVariantReadModel } from '@ecomerece/domain';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { Title } from '@ecomerece/domain/value-objects/title.vo';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import type { ProductVariantPersistence } from './product-variant.model';

export const productVariantMapper = {
  persistenceToAggregate(doc: ProductVariantPersistence): ProductVariantAggregate {
    return ProductVariantAggregate.rehydrate(
      Id.rehydrate(doc._id),
      Id.rehydrate(doc.productId),

      Money.rehydrate(doc.discountedPrice),
      Money.rehydrate(doc.price),
      doc.active,
      Title.rehydrate(doc.title),
      DeleteInfoVO.rehydrate(
        doc.deleted.deletedBy ? Id.rehydrate(doc.deleted.deletedBy) : null,
        doc.deleted.deleted,
        doc.deleted.deletedFrom ? EffectiveDate.rehydrate(doc.deleted.deletedFrom) : null,
        doc.deleted.reason ? Reason.rehydrate(doc.deleted.reason) : null,
      ),
      Quantity.rehydrate(doc.version),
      EffectiveDate.rehydrate(doc.createdAt),
    );
  },

  aggregateToPersistence(product: ProductVariantAggregate) {
    return {
      _id: product.id.value,
      productId: product.productId.value,

      discountedPrice: product.discountedPrice.value,
      price: product.price.value,
      title: product.title.value,
      deleted: {
        deleted: product.delete.deleted,
        deletedFrom: product.delete.from?.value ?? null,
        deletedBy: product.delete.performedBy?.value ?? null,
        reason: product.delete.reason?.value ?? null,
      },
      active: product.active,
      createdAt: product.createdAt.value,
      updatedAt: EffectiveDate.today().value,
    };
  },

  aggregateToReadModel(product: ProductVariantAggregate): ProductVariantReadModel {
    return {
      productId: product.productId.value,
      id: product.id.value,
      discountedPrice: product.discountedPrice.value,
      price: product.price.value,
      active: product.active,
      title: product.title.value,
      deleted: {
        deleted: product.delete.deleted,
        deletedFrom: product.delete.from?.value ?? null,
        deletedBy: product.delete.performedBy?.value ?? null,
        reason: product.delete.reason?.value ?? null,
      },
      createdAt: product.createdAt.value,
    };
  },

  aggregateToResponseReadModel(product: ProductVariantAggregate): ProductVariantResponseReadModel {
    return {
      productId: product.productId.value,
      id: product.id.value,
      discountedPrice: product.discountedPrice.value,
      price: product.price.value,
      active: product.active,
      title: product.title.value,
      createdAt: product.createdAt.value,
    };
  },
};
