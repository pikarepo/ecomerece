import { describe, expect, it } from 'bun:test';
import { booleanSchema, idSchema, imageDataUriSchema, moneySchema, urlSchema } from '../dtos';
import * as requestDtos from '../request-dtos';
import { createMyAddressDto, getAdminPaginatedAddressesQuerySchema } from '../request-dtos/address';
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
const otherUuid = '00000000-0000-7000-8000-000000000200';
const nilUuid = '00000000-0000-0000-0000-000000000000';
const v4Uuid = '00000000-0000-4000-8000-000000000007';
const futureIso = future.toISOString();

type ParseResult = { success: boolean; data?: unknown };

type SchemaLike = { safeParse(input: unknown): unknown };

function parse(schema: SchemaLike, input: unknown): ParseResult {
  return schema.safeParse(input) as ParseResult;
}

function field(schema: SchemaLike, input: Record<string, unknown>, key: string): unknown {
  const result = parse(schema, input);
  if (!result.success || typeof result.data !== 'object' || result.data === null) return undefined;
  return (result.data as Record<string, unknown>)[key];
}

function evidence(tag: string, data: Record<string, unknown>) {
  const prefix = tag.startsWith('SHARED-') ? '' : 'SHARED-';
  console.log(`[${prefix}${tag}] ${JSON.stringify(data)}`);
}

function repeat(value: string, count: number) {
  return Array.from({ length: count }, () => value);
}

function accepted(schema: SchemaLike, input: unknown): unknown {
  const result = parse(schema, input);
  if (!result.success) throw new Error('Fixture was rejected before the exploit assertion.');
  return result.data;
}

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

describe('SHARED boolean coercion exploits', () => {
  const booleanFilters: Array<[string, SchemaLike, string]> = [
    ['ADDR-BOOL', requestDtos.getAdminPaginatedAddressesQuerySchema, 'deleted'],
    ['CAT-BOOL', requestDtos.getAdminPaginatedCategoriesSchema, 'deleted'],
    ['INV-BOOL', requestDtos.getAdminPaginatedInventoryQuerySchema, 'inStock'],
    ['NOT-BOOL', requestDtos.getMyNotificationsQuerySchema, 'isRead'],
    ['ORD-BOOL', requestDtos.getAdminPaginatedOrdersQuerySchema, 'deleted'],
    ['PVA-BOOL', requestDtos.getAdminPaginatedVariantsQuerySchema, 'active'],
    ['PRM-BOOL', requestDtos.getAdminCouponsQuerySchema, 'deleted'],
    ['RET-BOOL', requestDtos.getAdminReturnsQuerySchema, 'deleted'],
    ['SHIP-BOOL', requestDtos.getAdminShipmentsQuerySchema, 'deleted'],
    ['USR-BOOL', requestDtos.getAdminPaginatedUsersQuerySchema, 'banned'],
    ['VEN-BOOL', requestDtos.getAdminPaginatedVendorsQuerySchema, 'deleted'],
    ['PAY-BOOL', requestDtos.getAdminPaymentsQuerySchema, 'deleted'],
  ];

  for (const [tag, schema, key] of booleanFilters) {
    it.failing(`${tag} treats the string "false" as false`, () => {
      expect(field(schema, { [key]: 'true' }, key)).toBe(true);
      const result = parse(schema, { [key]: 'false' });
      const value = result.success ? (result.data as Record<string, unknown>)[key] : false;

      evidence(tag, { key, input: 'false', success: result.success, value });
      expect(result.success && value).toBe(false);
    });
  }

  it.failing('SHARED-BOOL-EMPTY accepts empty strings and empty objects as boolean filters', () => {
    expect(
      field(requestDtos.getAdminPaginatedVendorsQuerySchema, { deleted: 'true' }, 'deleted'),
    ).toBe(true);
    const variants = ['', null, {}, []];
    const values = variants.map((value) => ({
      value,
      parsed: field(requestDtos.getAdminPaginatedVendorsQuerySchema, { deleted: value }, 'deleted'),
    }));

    evidence('SHARED-BOOL-EMPTY', { values });
    for (const variant of values) expect(variant.parsed).toBe(false);
  });

  it('SHARED-BOOL-STRICT keeps the dedicated booleanSchema strict', () => {
    expect(booleanSchema.safeParse('true').success).toBe(false);
    expect(booleanSchema.safeParse('false').success).toBe(false);
    expect(booleanSchema.parse(undefined)).toBe(false);
  });

  it.failing('SHARED-BOOL-SETTING inverts autoDenormalizeEnabled from a string', () => {
    expect(
      field(
        requestDtos.updateProductStatsSettingsSchema,
        { autoDenormalizeEnabled: true },
        'autoDenormalizeEnabled',
      ),
    ).toBe(true);
    const result = parse(requestDtos.updateProductStatsSettingsSchema, {
      autoDenormalizeEnabled: 'false',
    });
    const value = result.success
      ? (result.data as Record<string, unknown>).autoDenormalizeEnabled
      : false;

    evidence('SHARED-BOOL-SETTING', { success: result.success, value });
    expect(result.success && value).toBe(false);
  });
});

describe('SHARED numeric coercion exploits', () => {
  it.failing('SHARED-NUM-REFUND accepts booleans, arrays and hex as refund amounts', () => {
    expect(
      parse(requestDtos.refundPaymentDto, { amount: 5, reason: 'valid refund reason' }).success,
    ).toBe(true);
    const hostile = [true, [5], '0x10'];
    const results = hostile.map((amount) => ({
      amount,
      parsed: field(
        requestDtos.refundPaymentDto,
        { amount, reason: 'valid refund reason' },
        'amount',
      ),
    }));

    evidence('SHARED-NUM-REFUND', { results });
    for (const result of results) expect(result.parsed).toBeUndefined();
  });

  it.failing('SHARED-NUM-CAPTURE accepts a boolean as a capture amount', () => {
    expect(parse(requestDtos.capturePaymentDto, { amount: 5 }).success).toBe(true);
    const result = parse(requestDtos.capturePaymentDto, { amount: true });
    evidence('SHARED-NUM-CAPTURE', {
      success: result.success,
      value: result.success ? (result.data as Record<string, unknown>).amount : undefined,
    });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-NUM-PAYOUT accepts a boolean as a payout amount', () => {
    expect(parse(requestDtos.requestPayoutDto, { amount: 5 }).success).toBe(true);
    const result = parse(requestDtos.requestPayoutDto, { amount: true });
    evidence('SHARED-NUM-PAYOUT', {
      success: result.success,
      value: result.success ? (result.data as Record<string, unknown>).amount : undefined,
    });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-NUM-LIMIT accepts boolean, array, hex and fractional limits', () => {
    expect(
      field(requestDtos.getPaginatedStatsQuerySchema, { entityType: 'product', limit: 5 }, 'limit'),
    ).toBe(5);
    const hostile = [true, [3], '0x10', 1.5];
    const results = hostile.map((limit) => ({
      limit,
      value: field(
        requestDtos.getPaginatedStatsQuerySchema,
        { entityType: 'product', limit },
        'limit',
      ),
    }));

    evidence('SHARED-NUM-LIMIT', { results });
    for (const result of results) expect(Number.isInteger(result.value)).toBe(true);
  });

  it('SHARED-NUM-BOUNDS rejects NaN, Infinity and out-of-range numbers', () => {
    expect(moneySchema.safeParse(Number.NaN).success).toBe(false);
    expect(moneySchema.safeParse(Number.POSITIVE_INFINITY).success).toBe(false);
    expect(moneySchema.safeParse(0.99).success).toBe(false);
    expect(
      requestDtos.getPaginatedStatsQuerySchema.safeParse({ entityType: 'product', limit: 101 })
        .success,
    ).toBe(false);
  });
});

describe('SHARED date coercion exploits', () => {
  const hostileDates = [null, false, 0, '2026-02-30', '2025'];

  it.failing('SHARED-DATE-CHECKOUT turns null, false, zero and rollover dates into valid dates', () => {
    const valid = {
      idempotentKey: uuid,
      addressId: uuid,
      waitingTime: futureIso,
      cartItemIds: [uuid],
    };
    expect(parse(requestDtos.checkoutCartDto, valid).success).toBe(true);
    const results = hostileDates.map((waitingTime) => ({
      waitingTime,
      parsed: field(requestDtos.checkoutCartDto, { ...valid, waitingTime }, 'waitingTime'),
    }));

    evidence('SHARED-DATE-CHECKOUT', { results });
    for (const result of results) expect(result.parsed).toBeUndefined();
  });

  it.failing('SHARED-DATE-ORDER accepts null and rolled-over waiting times', () => {
    const valid = {
      idempotentKey: uuid,
      addressId: uuid,
      waitingTime: futureIso,
      items: [{ variantId: uuid, quantity: 1 }],
    };
    expect(parse(requestDtos.createMyOrderDto, valid).success).toBe(true);
    const results = hostileDates.map((waitingTime) => ({
      waitingTime,
      success: parse(requestDtos.createMyOrderDto, { ...valid, waitingTime }).success,
    }));

    evidence('SHARED-DATE-ORDER', { results });
    for (const result of results) expect(result.success).toBe(false);
  });

  it.failing('SHARED-DATE-SHIPMENT accepts null and rolled-over delivery estimates', () => {
    const valid = {
      orderId: uuid,
      carrier: 'dhl',
      shippingMethod: 'standard',
      cost: 10,
      weightGrams: 100,
      estimatedDelivery: futureIso,
    };
    expect(parse(requestDtos.createShipmentDto, valid).success).toBe(true);
    const results = [null, '2026-02-30'].map((estimatedDelivery) => ({
      estimatedDelivery,
      success: parse(requestDtos.createShipmentDto, { ...valid, estimatedDelivery }).success,
    }));

    evidence('SHARED-DATE-SHIPMENT', { results });
    for (const result of results) expect(result.success).toBe(false);
  });

  it.failing('SHARED-DATE-COUPON accepts null startsAt and an inverted window', () => {
    const valid = {
      code: 'SALE-10',
      discountType: 'percentage',
      discountValue: 10,
      startsAt: '2026-01-01T00:00:00.000Z',
      expiresAt: '2026-12-31T00:00:00.000Z',
    };
    expect(parse(requestDtos.createCouponDto, valid).success).toBe(true);
    const nullStart = parse(requestDtos.createCouponDto, { ...valid, startsAt: null });
    const inverted = parse(requestDtos.createCouponDto, {
      ...valid,
      startsAt: '2026-12-31T00:00:00.000Z',
      expiresAt: '2026-01-01T00:00:00.000Z',
    });

    evidence('SHARED-DATE-COUPON', {
      nullStart: nullStart.success,
      inverted: inverted.success,
    });
    expect(nullStart.success).toBe(false);
    expect(inverted.success).toBe(false);
  });
});

describe('SHARED coupon exploits', () => {
  const coupon = {
    code: 'SALE-10',
    discountType: 'percentage',
    discountValue: 10,
    startsAt: '2026-01-01T00:00:00.000Z',
  };

  it.failing('SHARED-COUPON-PERCENT allows a 10000% discount', () => {
    expect(parse(requestDtos.createCouponDto, coupon).success).toBe(true);
    const result = parse(requestDtos.createCouponDto, { ...coupon, discountValue: 10_000 });
    evidence('SHARED-COUPON-PERCENT', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-COUPON-UPDATE re-applies create defaults to an empty patch', () => {
    accepted(requestDtos.createCouponDto, coupon);
    const result = parse(requestDtos.updateCouponDto, {});
    evidence('SHARED-COUPON-UPDATE', { value: result.data });
    expect(result.data).toEqual({});
  });
});

describe('SHARED unbounded collection exploits', () => {
  it.failing('SHARED-ARR-ORDER accepts 5000 order lines', () => {
    const one = { variantId: uuid, quantity: 1 };
    const valid = { idempotentKey: uuid, addressId: uuid, waitingTime: futureIso, items: [one] };
    expect(parse(requestDtos.createMyOrderDto, valid).success).toBe(true);
    const result = parse(requestDtos.createMyOrderDto, {
      ...valid,
      items: repeat(one, 5000),
    });
    evidence('SHARED-ARR-ORDER', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ARR-CHECKOUT accepts 5000 cart ids', () => {
    const valid = {
      idempotentKey: uuid,
      addressId: uuid,
      waitingTime: futureIso,
      cartItemIds: [uuid],
    };
    expect(parse(requestDtos.checkoutCartDto, valid).success).toBe(true);
    const result = parse(requestDtos.checkoutCartDto, {
      ...valid,
      cartItemIds: repeat(uuid, 5000),
    });
    evidence('SHARED-ARR-CHECKOUT', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ARR-CANCEL accepts 5000 cancellation targets', () => {
    expect(
      parse(requestDtos.cancelMyOrderItemsDto, { orderId: uuid, itemIds: [uuid] }).success,
    ).toBe(true);
    const result = parse(requestDtos.cancelMyOrderItemsDto, {
      orderId: uuid,
      itemIds: repeat(uuid, 5000),
    });
    evidence('SHARED-ARR-CANCEL', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ARR-PRODUCT accepts 10000 ingredients and 10000 images', () => {
    const product = {
      title: 'Product title',
      categoryId: uuid,
      appearance: 'public',
      description: 'A product description.',
      ingredient: { isIngredients: true, ingredients: ['Sugar'] },
      disclaimer: { isDisclaimer: false, disclaimers: [] },
      image: { images: [{ url: https, alt: 'Product photo', default: true }] },
    };
    expect(parse(requestDtos.CreateMyProductDtoSchema, product).success).toBe(true);
    const abundant = {
      ...product,
      ingredient: { isIngredients: true, ingredients: repeat('Sugar', 10_000) },
      image: {
        images: repeat({ url: https, alt: 'Product photo', default: false }, 10_000),
      },
    };
    const result = parse(requestDtos.CreateMyProductDtoSchema, abundant);
    evidence('SHARED-ARR-PRODUCT', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ARR-REVIEW accepts 10000 evidence urls', () => {
    const review = {
      productId: uuid,
      orderId: uuid,
      rating: 5,
      title: 'Great product',
      comment: 'A detailed and honest comment.',
    };
    expect(parse(requestDtos.createMyReviewDtoSchema, review).success).toBe(true);
    const result = parse(requestDtos.createMyReviewDtoSchema, {
      ...review,
      images: repeat(https, 10_000),
    });
    evidence('SHARED-ARR-REVIEW', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ARR-STATS accepts 500 oversized aggregate ids', () => {
    const valid = { entityType: 'product', ids: [uuid] };
    expect(parse(requestDtos.getStatsAggregateQuerySchema, valid).success).toBe(true);
    const oversized = 'x'.repeat(1000);
    const result = parse(requestDtos.getStatsAggregateQuerySchema, {
      entityType: 'product',
      ids: repeat(oversized, 500),
    });
    evidence('SHARED-ARR-STATS', { success: result.success, ids: 500, idLength: oversized.length });
    expect(result.success).toBe(false);
  });
});

describe('SHARED cross-field invariant exploits', () => {
  const product = {
    title: 'Product title',
    categoryId: uuid,
    appearance: 'public',
    description: 'A product description.',
    ingredient: { isIngredients: true, ingredients: ['Sugar'] },
    disclaimer: { isDisclaimer: false, disclaimers: [] },
    image: { images: [{ url: https, alt: 'Product photo', default: true }] },
  };

  it.failing('SHARED-XFIELD-INGREDIENT accepts a disabled flag with populated ingredients', () => {
    expect(parse(requestDtos.CreateMyProductDtoSchema, product).success).toBe(true);
    const result = parse(requestDtos.CreateMyProductDtoSchema, {
      ...product,
      ingredient: { isIngredients: false, ingredients: ['Sugar'] },
    });
    evidence('SHARED-XFIELD-INGREDIENT', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-XFIELD-DEFAULT-IMAGE accepts two default images', () => {
    expect(parse(requestDtos.CreateMyProductDtoSchema, product).success).toBe(true);
    const result = parse(requestDtos.CreateMyProductDtoSchema, {
      ...product,
      image: {
        images: [
          { url: https, alt: 'First photo', default: true },
          { url: https, alt: 'Second photo', default: true },
        ],
      },
    });
    evidence('SHARED-XFIELD-DEFAULT-IMAGE', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-XFIELD-PRICE accepts a discounted price above the list price', () => {
    const valid = {
      productId: uuid,
      discountedPrice: 8,
      price: 10,
      title: 'Variant title',
      active: true,
    };
    expect(parse(requestDtos.createMyProductVariantDto, valid).success).toBe(true);
    const create = parse(requestDtos.createMyProductVariantDto, { ...valid, discountedPrice: 999 });
    const update = parse(requestDtos.updateMyVariatPriceDto, {
      productId: uuid,
      variantId: otherUuid,
      price: 10,
      discountedPrice: 999,
    });

    evidence('SHARED-XFIELD-PRICE', { create: create.success, update: update.success });
    expect(create.success).toBe(false);
    expect(update.success).toBe(false);
  });

  it.failing('SHARED-XFIELD-IMAGE-INDEX accepts a fractional default image index', () => {
    expect(parse(requestDtos.deafultImageDto, { productId: uuid, index: 2 }).success).toBe(true);
    const result = parse(requestDtos.deafultImageDto, { productId: uuid, index: 1.5 });
    evidence('SHARED-XFIELD-IMAGE-INDEX', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-XFIELD-TIMESERIES accepts arbitrary from/to tokens and an inverted range', () => {
    const valid = { entityType: 'product', from: '2026-01-01', to: '2026-02-01' };
    expect(parse(requestDtos.getStatsAggregateTimeSeriesQuerySchema, valid).success).toBe(true);
    const injected = parse(requestDtos.getStatsAggregateTimeSeriesQuerySchema, {
      entityType: 'product',
      from: 'x; DROP',
      to: 'y',
    });
    const inverted = parse(requestDtos.getStatsAggregateTimeSeriesQuerySchema, {
      entityType: 'product',
      from: '2026-12-31',
      to: '2026-01-01',
    });

    evidence('SHARED-XFIELD-TIMESERIES', {
      injected: injected.success,
      inverted: inverted.success,
    });
    expect(injected.success).toBe(false);
    expect(inverted.success).toBe(false);
  });
});

describe('SHARED identifier exploits', () => {
  it.failing('SHARED-ID-NIL accepts the nil uuid where a generated id is required', () => {
    expect(idSchema.safeParse(uuid).success).toBe(true);
    const result = idSchema.safeParse(nilUuid);
    evidence('SHARED-ID-NIL', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ID-RECOVER accepts a non-uuid recovery target', () => {
    expect(parse(requestDtos.RecoverUserDTOSchema, { userId: uuid }).success).toBe(true);
    const result = parse(requestDtos.RecoverUserDTOSchema, { userId: 'admin' });
    evidence('SHARED-ID-RECOVER', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-ID-PAYMENT accepts traversal and Mongo-shaped order ids', () => {
    expect(parse(requestDtos.createPaymentDto, { orderId: uuid }).success).toBe(true);
    const hostile = ['../../etc/passwd', '{"$ne":null}', 'aaaaa'];
    const results = hostile.map((orderId) => ({
      orderId,
      success: parse(requestDtos.createPaymentDto, { orderId }).success,
      querySuccess: parse(requestDtos.getMyPaymentsQuerySchema, { orderId }).success,
    }));

    evidence('SHARED-ID-PAYMENT', { results });
    for (const result of results) {
      expect(result.success).toBe(false);
      expect(result.querySuccess).toBe(false);
    }
  });

  it.failing('SHARED-ID-ADMIN-QUERIES accept arbitrary vendor, buyer and payout ids', () => {
    const hostile = 'DROP TABLE';
    const results = {
      paymentBuyer: parse(requestDtos.getAdminPaymentsQuerySchema, { buyerId: hostile }).success,
      payoutVendor: parse(requestDtos.getAdminPayoutsQuerySchema, { vendorId: hostile }).success,
      productCategory: parse(requestDtos.getAdminPaginatedProductsQuerySchema, {
        categoryId: hostile,
      }).success,
      productVendor: parse(requestDtos.getAdminPaginatedProductsQuerySchema, { vendorId: hostile })
        .success,
    };

    evidence('SHARED-ID-ADMIN-QUERIES', { results });
    for (const success of Object.values(results)) expect(success).toBe(false);
  });

  it.failing('SHARED-ID-PAYOUT-STATUS accepts an unknown status filter', () => {
    expect(parse(requestDtos.getPayoutsQuerySchema, { status: 'paid' }).success).toBe(true);
    const result = parse(requestDtos.getPayoutsQuerySchema, { status: 'DROP TABLE' });
    evidence('SHARED-ID-PAYOUT-STATUS', { success: result.success });
    expect(result.success).toBe(false);
  });

  it('SHARED-ID-V7 still rejects v4 ids in vendor admin DTOs', () => {
    expect(requestDtos.VerifyVendorDtoSchema.safeParse({ vendorId: v4Uuid }).success).toBe(false);
    expect(requestDtos.VerifyVendorDtoSchema.safeParse({ vendorId: uuid }).success).toBe(true);
  });
});

describe('SHARED payload shape exploits', () => {
  it.failing('SHARED-SHAPE-PROTOTYPE accepts operator-shaped home query filters', () => {
    const filter = { $where: '1 == 1', 'deleted.deleted': false };
    expect(parse(requestDtos.baseQueryDtoSchema, { filter: {} }).success).toBe(true);
    const result = parse(requestDtos.baseQueryDtoSchema, { filter });
    evidence('SHARED-SHAPE-PROTOTYPE', { success: result.success, filter });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-SHAPE-LIMIT accepts an unbounded home container limit', () => {
    expect(parse(requestDtos.baseQueryDtoSchema, { limit: 20 }).success).toBe(true);
    const result = parse(requestDtos.baseQueryDtoSchema, { limit: 1_000_000 });
    evidence('SHARED-SHAPE-LIMIT', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-SHAPE-DEFAULT bypasses title validation through a default value', () => {
    expect(
      requestDtos.createProductContainerDtoSchema.safeParse({ heading: 'Deals' }).success,
    ).toBe(true);
    const result = requestDtos.createProductContainerDtoSchema.safeParse({ heading: 'Deals' });
    const subTitle = result.success ? result.data.subTitle : undefined;
    evidence('SHARED-SHAPE-DEFAULT', { subTitle });
    expect(typeof subTitle === 'string' && subTitle.length >= 3).toBe(true);
  });

  it.failing('SHARED-SHAPE-MASS-ASSIGNMENT strips privileged unknown keys instead of rejecting them', () => {
    expect(
      parse(requestDtos.createCategoryDto, { title: 'Electronics', image: https }).success,
    ).toBe(true);
    const result = parse(requestDtos.createCategoryDto, {
      title: 'Electronics',
      image: https,
      role: 'admin',
      isDeleted: true,
      createdBy: uuid,
    });
    evidence('SHARED-SHAPE-MASS-ASSIGNMENT', { success: result.success, data: result.data });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-SHAPE-DATA-URI accepts an unbounded base64 payload', () => {
    const huge = `data:image/png;base64,${'A'.repeat(200_000)}`;
    expect(imageDataUriSchema.safeParse(dataUri).success).toBe(true);
    const result = imageDataUriSchema.safeParse(huge);
    evidence('SHARED-SHAPE-DATA-URI', { success: result.success, length: huge.length });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-SHAPE-VENDOR-CONTACT accepts a one-character phone and an unbounded email', () => {
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
    expect(parse(requestDtos.CreateVendorDtoSchema, vendor).success).toBe(true);
    const weakPhone = parse(requestDtos.CreateVendorDtoSchema, {
      ...vendor,
      contacts: { ...vendor.contacts, phone: 'x' },
    });
    const hugeEmail = parse(requestDtos.CreateVendorDtoSchema, {
      ...vendor,
      contacts: { ...vendor.contacts, email: `${'a'.repeat(10_000)}@example.com` },
    });

    evidence('SHARED-SHAPE-VENDOR-CONTACT', {
      weakPhone: weakPhone.success,
      hugeEmail: hugeEmail.success,
    });
    expect(weakPhone.success).toBe(false);
    expect(hugeEmail.success).toBe(false);
  });

  it('SHARED-SHAPE-URL still rejects javascript and credential-bearing urls', () => {
    expect(urlSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(urlSchema.safeParse('https://trusted.example@evil.example/a.png').success).toBe(false);
  });

  it('SHARED-SHAPE-EVIDENCE-CAP still caps order-request images at five', () => {
    const base = { orderId: uuid, type: 'return', reason: 'damaged in transit' };
    expect(
      parse(requestDtos.createOrderRequestDto, { ...base, images: repeat(https, 5) }).success,
    ).toBe(true);
    expect(
      parse(requestDtos.createOrderRequestDto, { ...base, images: repeat(https, 6) }).success,
    ).toBe(false);
  });
});
