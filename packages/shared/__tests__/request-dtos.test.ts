import { describe, expect, it } from 'bun:test';
import { getAdminPaginatedAddressesQuerySchema, createMyAddressDto } from '../request-dtos/address';
import { addCartItemDto, checkoutCartDto } from '../request-dtos/cart';
import {
  createCategoryDto,
  getAdminPaginatedCategoriesSchema,
  getPaginatedDto,
} from '../request-dtos/category';
import {
  createHomeCategoryDtoSchema,
  createPromoDtoSchema,
  createSlideDtoSchema,
  reorderHomeCategoriesDtoSchema,
  setFeaturesDtoSchema,
} from '../request-dtos/home';
import {
  createMyInventoryDto,
  getAdminPaginatedInventoryQuerySchema,
} from '../request-dtos/inventory';
import { buyNowOrderDto, createMyOrderDto, updateOrderDto } from '../request-dtos/order';
import {
  cancelMyOrderItemsDto,
  getAdminPaginatedOrderItemsQuerySchema,
  updateOrderItemDto,
} from '../request-dtos/order-items';
import { createOrderRequestDto } from '../request-dtos/order-request';
import {
  CreateMyProductDtoSchema,
  deafultImageDto,
  getAdminPaginatedProductsQuerySchema,
  getPaginatedProductsQuerySchema,
  productPublicSortSchema,
} from '../request-dtos/product';
import {
  createMyProductVariantDto,
  getAdminPaginatedVariantsQuerySchema,
} from '../request-dtos/product-variant';
import {
  createMyReviewDtoSchema,
  getPaginatedReviewsQuerySchema,
  updateMyReviewDto,
} from '../request-dtos/review';
import {
  getPaginatedStatsQuerySchema,
  getProductStatsOverviewQuerySchema,
  updateProductStatsSettingsSchema,
} from '../request-dtos/stats';
import { BanUserDTOSchema, SignInDtoSchema, UserRoleDtoSchema } from '../request-dtos/user';
import {
  CreateVendorDtoSchema,
  DeleteVendorDtoSchema,
  RejectVendorDtoSchema,
  UpdateMyVendorMetaDtoSchema,
  VerifyVendorDtoSchema,
} from '../request-dtos/vendor';

const uuid = '00000000-0000-7000-8000-000000000100';
const vendorUuid = '00000000-0000-7000-8000-000000000200';
const future = new Date(Date.now() + 60 * 60 * 1000);
const https = 'https://cdn.example.com/image.png';
const dataUri = 'data:image/png;base64,aGVsbG8=';

describe('address request DTOs', () => {
  const address = {
    streetAddress: '12 Main Street',
    city: 'Springfield',
    state: 'Illinois',
    postalCode: '62701',
    country: 'USA',
  };

  it('accepts a complete address and trims its text fields', () => {
    expect(createMyAddressDto.parse({ ...address, city: '  Springfield  ' })).toMatchObject({
      city: 'Springfield',
      streetAddress: '12 Main Street',
    });
  });

  it('rejects a missing field and an over-long postal code', () => {
    expect(createMyAddressDto.safeParse({ ...address, city: '' }).success).toBe(false);
    expect(createMyAddressDto.safeParse({ ...address, postalCode: '1'.repeat(11) }).success).toBe(
      false,
    );
  });

  it('defaults admin pagination and coerces limits', () => {
    expect(getAdminPaginatedAddressesQuerySchema.parse({})).toMatchObject({
      limit: 20,
      direction: 'next',
    });
    expect(getAdminPaginatedAddressesQuerySchema.parse({ limit: '5' }).limit).toBe(5);
    expect(getAdminPaginatedAddressesQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe('cart request DTOs', () => {
  it('requires a variant id and a positive quantity', () => {
    expect(addCartItemDto.safeParse({ variantId: uuid, quantity: 1 }).success).toBe(true);
    expect(addCartItemDto.safeParse({ variantId: uuid, quantity: 0 }).success).toBe(false);
    expect(addCartItemDto.safeParse({ variantId: 'bad', quantity: 1 }).success).toBe(false);
  });

  it('requires at least one cart line at checkout', () => {
    const base = { idempotentKey: uuid, addressId: uuid, waitingTime: future };

    expect(checkoutCartDto.safeParse({ ...base, cartItemIds: [] }).success).toBe(false);
    expect(checkoutCartDto.safeParse({ ...base, cartItemIds: [uuid] }).success).toBe(true);
  });

  it('coerces an ISO waiting time into a Date', () => {
    const parsed = checkoutCartDto.parse({
      idempotentKey: uuid,
      addressId: uuid,
      waitingTime: future.toISOString(),
      cartItemIds: [uuid],
    });

    expect(parsed.waitingTime).toBeInstanceOf(Date);
  });
});

describe('category request DTOs', () => {
  it('accepts a url or a data uri as the category image', () => {
    expect(createCategoryDto.safeParse({ title: 'Electronics', image: https }).success).toBe(true);
    expect(createCategoryDto.safeParse({ title: 'Electronics', image: dataUri }).success).toBe(
      true,
    );
  });

  it('enforces the pagination window of the category lists', () => {
    expect(getPaginatedDto.safeParse({ limit: 9 }).success).toBe(false);
    expect(getPaginatedDto.safeParse({ limit: 50 }).success).toBe(true);
    expect(getPaginatedDto.parse({ search: '  shoes  ' }).search).toBe('shoes');
    expect(getAdminPaginatedCategoriesSchema.safeParse({ limit: 51 }).success).toBe(false);
  });
});

describe('home request DTOs', () => {
  it('applies the design defaults for a home category', () => {
    expect(createHomeCategoryDtoSchema.parse({ name: 'Deals', image: https })).toMatchObject({
      accent: '#3B82F6',
      icon: 'Box',
    });
  });

  it('applies the design defaults for slides and promos', () => {
    const slide = createSlideDtoSchema.parse({
      tag: 'New',
      title: 'Fresh picks',
      cta: 'Shop now',
      image: https,
    });
    expect(slide).toMatchObject({ subhead: '', subtitle: '', accent: '#3B82F6' });

    const promo = createPromoDtoSchema.parse({
      title: 'Summer sale',
      subtitle: 'Limited offer',
      image: https,
    });
    expect(promo).toMatchObject({ accent: '#FB923C', link: 'https://example.com/client/home' });
  });

  it('requires an ordered id list to be non-empty and caps features at eight', () => {
    expect(reorderHomeCategoriesDtoSchema.safeParse({ orderedIds: [] }).success).toBe(false);
    expect(
      setFeaturesDtoSchema.safeParse({
        features: Array.from({ length: 9 }, () => ({
          title: 'Feature title',
          detail: 'A detailed feature description.',
        })),
      }).success,
    ).toBe(false);
  });
});

describe('inventory request DTOs', () => {
  it('requires positive availability and threshold values', () => {
    expect(
      createMyInventoryDto.safeParse({ variantId: uuid, lowStockThreshold: 1, available: 1 })
        .success,
    ).toBe(true);
    expect(
      createMyInventoryDto.safeParse({ variantId: uuid, lowStockThreshold: 0, available: 1 })
        .success,
    ).toBe(false);
    expect(
      createMyInventoryDto.safeParse({ variantId: uuid, lowStockThreshold: 1, available: 0 })
        .success,
    ).toBe(false);
  });

  it('defaults the admin inventory pagination', () => {
    expect(getAdminPaginatedInventoryQuerySchema.parse({})).toMatchObject({
      limit: 20,
      direction: 'next',
    });
  });
});

describe('order request DTOs', () => {
  it('defaults safeOrder to false and requires at least one line', () => {
    const order = {
      idempotentKey: uuid,
      addressId: uuid,
      waitingTime: future,
      items: [{ variantId: uuid, quantity: 1 }],
    };

    expect(createMyOrderDto.parse(order).safeOrder).toBe(false);
    expect(createMyOrderDto.safeParse({ ...order, items: [] }).success).toBe(false);
    expect(
      createMyOrderDto.safeParse({ ...order, items: [{ variantId: uuid, quantity: 0 }] }).success,
    ).toBe(false);
  });

  it('accepts buy-now and validates the update payload', () => {
    expect(
      buyNowOrderDto.safeParse({
        idempotentKey: uuid,
        addressId: uuid,
        variantId: uuid,
        quantity: 2,
        waitingTime: future,
      }).success,
    ).toBe(true);

    expect(
      updateOrderDto.safeParse({ totalPrice: 0, address: '12 Main Street, Springfield' }).success,
    ).toBe(false);
    expect(updateOrderDto.safeParse({ totalPrice: 20, address: 'short' }).success).toBe(false);
    expect(
      updateOrderDto.safeParse({
        totalPrice: 20,
        address: '12 Main Street, Springfield, Illinois, 62701, USA',
      }).success,
    ).toBe(true);
  });
});

describe('order item request DTOs', () => {
  it('requires at least one item to cancel', () => {
    expect(cancelMyOrderItemsDto.safeParse({ orderId: uuid, itemIds: [] }).success).toBe(false);
    expect(cancelMyOrderItemsDto.safeParse({ orderId: uuid, itemIds: [uuid] }).success).toBe(true);
  });

  it('accepts every documented status in the admin query and rejects unknown ones', () => {
    for (const status of [
      'pending',
      'confirmed',
      'completed',
      'returned',
      'refunded',
      'cancelled',
      'failed',
    ]) {
      expect(getAdminPaginatedOrderItemsQuerySchema.safeParse({ status }).success).toBe(true);
    }
    expect(getAdminPaginatedOrderItemsQuerySchema.safeParse({ status: 'lost' }).success).toBe(
      false,
    );
  });

  it('requires quantity, waiting time and price on update', () => {
    expect(
      updateOrderItemDto.safeParse({ quantity: 1, waitingTime: future, price: 5 }).success,
    ).toBe(true);
    expect(
      updateOrderItemDto.safeParse({ quantity: 1, waitingTime: future, price: 0 }).success,
    ).toBe(false);
  });
});

describe('order request (return/refund) DTOs', () => {
  it('accepts a return request with up to five evidence images', () => {
    expect(
      createOrderRequestDto.safeParse({
        orderId: uuid,
        type: 'return',
        reason: 'damaged in transit',
        images: [https, dataUri],
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown type and more than five images', () => {
    expect(
      createOrderRequestDto.safeParse({
        orderId: uuid,
        type: 'exchange',
        reason: 'damaged in transit',
      }).success,
    ).toBe(false);
    expect(
      createOrderRequestDto.safeParse({
        orderId: uuid,
        type: 'refund',
        reason: 'damaged in transit',
        images: Array.from({ length: 6 }, () => https),
      }).success,
    ).toBe(false);
  });
});

describe('product request DTOs', () => {
  const product = {
    title: 'Product title',
    categoryId: uuid,
    appearance: 'public',
    description: 'A product description.',
    ingredient: { isIngredients: true, ingredients: ['Sugar'] },
    disclaimer: { isDisclaimer: false, disclaimers: [] },
    image: { images: [{ url: https, alt: 'Product photo', default: true }] },
  };

  it('accepts a complete product payload', () => {
    expect(CreateMyProductDtoSchema.safeParse(product).success).toBe(true);
  });

  it('rejects a product without images, with a bad appearance or an unknown field type', () => {
    expect(CreateMyProductDtoSchema.safeParse({ ...product, image: { images: [] } }).success).toBe(
      false,
    );
    expect(CreateMyProductDtoSchema.safeParse({ ...product, appearance: 'hidden' }).success).toBe(
      false,
    );
    expect(
      CreateMyProductDtoSchema.safeParse({ ...product, ingredient: { isIngredients: false } })
        .success,
    ).toBe(false);
  });

  it('caps the default image index at three', () => {
    expect(deafultImageDto.safeParse({ productId: uuid, index: 3 }).success).toBe(true);
    expect(deafultImageDto.safeParse({ productId: uuid, index: 4 }).success).toBe(false);
  });

  it('validates the public and admin sort options', () => {
    expect(productPublicSortSchema.safeParse('most_sold').success).toBe(true);
    expect(productPublicSortSchema.safeParse('most_revenue').success).toBe(false);
    expect(getPaginatedProductsQuerySchema.parse({}).sort).toBe('newest');
    expect(getAdminPaginatedProductsQuerySchema.safeParse({ sort: 'most_revenue' }).success).toBe(
      true,
    );
  });
});

describe('product variant request DTOs', () => {
  it('requires both prices and a title', () => {
    expect(
      createMyProductVariantDto.safeParse({
        productId: uuid,
        discountedPrice: 8,
        price: 10,
        title: 'Variant title',
        active: true,
      }).success,
    ).toBe(true);
    expect(
      createMyProductVariantDto.safeParse({
        productId: uuid,
        discountedPrice: 0,
        price: 10,
        title: 'Variant title',
        active: true,
      }).success,
    ).toBe(false);
  });

  it('defaults the admin variant pagination', () => {
    expect(getAdminPaginatedVariantsQuerySchema.parse({})).toMatchObject({
      limit: 20,
      direction: 'next',
    });
  });
});

describe('review request DTOs', () => {
  const review = {
    productId: uuid,
    orderId: uuid,
    rating: 5,
    title: 'Great product',
    comment: 'A detailed and honest comment.',
  };

  it('accepts a review within the rating bounds', () => {
    expect(createMyReviewDtoSchema.safeParse(review).success).toBe(true);
    expect(createMyReviewDtoSchema.safeParse({ ...review, rating: 0 }).success).toBe(false);
    expect(createMyReviewDtoSchema.safeParse({ ...review, rating: 6 }).success).toBe(false);
  });

  it('requires a comment of at least ten characters', () => {
    expect(createMyReviewDtoSchema.safeParse({ ...review, comment: 'too short' }).success).toBe(
      false,
    );
    expect(
      updateMyReviewDto.safeParse({
        rating: 4,
        title: 'Updated title',
        comment: 'An updated detailed comment.',
      }).success,
    ).toBe(true);
  });

  it('constrains the review list rating filter', () => {
    expect(getPaginatedReviewsQuerySchema.parse({ rating: '5' }).rating).toBe(5);
    expect(getPaginatedReviewsQuerySchema.safeParse({ rating: 6 }).success).toBe(false);
  });
});

describe('stats request DTOs', () => {
  it('defaults aggregation, metric, sort and limit', () => {
    expect(getPaginatedStatsQuerySchema.parse({ entityType: 'product' })).toMatchObject({
      aggregation: 'lifetime',
      metric: 'views',
      sort: 'desc',
      limit: 20,
    });
  });

  it('rejects unknown entity types and unsupported metrics', () => {
    expect(getPaginatedStatsQuerySchema.safeParse({ entityType: 'planet' }).success).toBe(false);
    expect(
      getPaginatedStatsQuerySchema.safeParse({ entityType: 'product', metric: 'clicks' }).success,
    ).toBe(true);
    expect(
      getPaginatedStatsQuerySchema.safeParse({ entityType: 'product', metric: 'unknown' }).success,
    ).toBe(false);
  });

  it('clamps the overview window and settings ranges', () => {
    expect(getProductStatsOverviewQuerySchema.parse({})).toMatchObject({ months: 12, days: 30 });
    expect(getProductStatsOverviewQuerySchema.safeParse({ months: 25 }).success).toBe(false);
    expect(getProductStatsOverviewQuerySchema.safeParse({ days: 91 }).success).toBe(false);
    expect(updateProductStatsSettingsSchema.safeParse({ intervalHours: 0 }).success).toBe(false);
    expect(
      updateProductStatsSettingsSchema.safeParse({ vendorForceRefreshQuota: 1001 }).success,
    ).toBe(false);
    expect(updateProductStatsSettingsSchema.safeParse({ maxStalenessHours: 24 }).success).toBe(
      true,
    );
  });
});

describe('user request DTOs', () => {
  it('defaults a role assignment to customer', () => {
    expect(
      UserRoleDtoSchema.parse({
        userId: uuid,
        reason: 'promoting the account owner',
      }).role,
    ).toBe('customer');
  });

  it('requires a positive ban duration and a valid clerk id', () => {
    expect(
      BanUserDTOSchema.safeParse({ userId: uuid, forDays: 0, reason: 'abusive behaviour online' })
        .success,
    ).toBe(false);
    expect(
      BanUserDTOSchema.safeParse({ userId: 'abc', forDays: 3, reason: 'abusive behaviour online' })
        .success,
    ).toBe(false);
  });

  it('validates the sign-in payload shape', () => {
    expect(
      SignInDtoSchema.safeParse({
        name: { firstName: 'Jane', fullName: 'Jane Doe', middleName: undefined, lastName: 'Doe' },
        email: 'jane@example.com',
        image: https,
      }).success,
    ).toBe(true);
    expect(
      SignInDtoSchema.safeParse({
        name: { firstName: 'Jane', fullName: 'Jane Doe' },
        email: 'not-an-email',
        image: https,
      }).success,
    ).toBe(false);
  });
});

describe('vendor request DTOs', () => {
  const vendor = {
    title: 'Vendor Shop',
    description: 'A vendor description.',
    slug: 'vendor-shop',
    contacts: {
      phone: '+123456789',
      email: 'vendor@example.com',
      address: {
        streetAddress: '12 Main Street',
        city: 'Springfield',
        state: 'Illinois',
        postalCode: '62701',
        country: 'USA',
      },
    },
    image: { logo: https, banner: https },
  };

  it('accepts a complete vendor application', () => {
    expect(CreateVendorDtoSchema.safeParse(vendor).success).toBe(true);
  });

  it('rejects an invalid slug, email and a short description', () => {
    expect(CreateVendorDtoSchema.safeParse({ ...vendor, slug: 'Vendor Shop' }).success).toBe(false);
    expect(
      CreateVendorDtoSchema.safeParse({
        ...vendor,
        contacts: { ...vendor.contacts, email: 'nope' },
      }).success,
    ).toBe(false);
    expect(CreateVendorDtoSchema.safeParse({ ...vendor, description: 'short' }).success).toBe(
      false,
    );
  });

  it('requires uuid v7 ids for admin vendor actions', () => {
    expect(VerifyVendorDtoSchema.safeParse({ vendorId: vendorUuid }).success).toBe(true);
    expect(VerifyVendorDtoSchema.safeParse({ vendorId: '507f1f77bcf86cd799439011' }).success).toBe(
      false,
    );
    expect(
      DeleteVendorDtoSchema.safeParse({
        vendorId: vendorUuid,
        reason: 'violates the marketplace policy',
      }).success,
    ).toBe(true);
    expect(RejectVendorDtoSchema.safeParse({ vendorId: vendorUuid, reason: 'short' }).success).toBe(
      false,
    );
  });

  it('validates the editable vendor profile fields', () => {
    expect(
      UpdateMyVendorMetaDtoSchema.safeParse({
        title: 'New Shop',
        slug: 'new-shop',
        description: 'A new description.',
      }).success,
    ).toBe(true);
    expect(
      UpdateMyVendorMetaDtoSchema.safeParse({
        title: 'New Shop',
        slug: 'New Shop',
        description: 'A new description.',
      }).success,
    ).toBe(false);
  });
});
