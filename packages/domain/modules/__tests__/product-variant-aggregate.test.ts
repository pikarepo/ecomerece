import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Money, Reason, Title } from '../../value-objects';
import { ProductVariantAggregate } from '../product-variant/product-variant.aggregate';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');

function variant(overrides: { active?: boolean; price?: number; discountedPrice?: number } = {}) {
  return ProductVariantAggregate.create({
    id: id(300),
    productId: id(400),
    discountedPrice: Money.create(overrides.discountedPrice ?? 8),
    price: Money.create(overrides.price ?? 10),
    title: Title.create('Variant title'),
    active: overrides.active ?? true,
  });
}

function deletedVariant() {
  const aggregate = variant();
  aggregate.deleteProduct(id(9), reason());
  aggregate.clearEvents();
  return aggregate;
}

describe('ProductVariantAggregate creation', () => {
  it('accepts an equal price and discount and raises one created event', () => {
    const aggregate = variant({ price: 10, discountedPrice: 10 });

    expect(aggregate.price.value).toBe(10);
    expect(aggregate.discountedPrice.value).toBe(10);
    expect(aggregate.productId).toEqual(id(400));
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['product-variant.created']);
  });

  it('refuses a discount higher than the price', () => {
    expect(() => variant({ price: 8, discountedPrice: 10 })).toThrow(
      'The discount must be lower than the actual price.',
    );
  });
});

describe('ProductVariantAggregate pricing', () => {
  it('updates both prices when the discount is not higher', () => {
    const aggregate = variant();
    aggregate.clearEvents();

    aggregate.updatePrice(Money.create(12), Money.create(9), id(4));

    expect(aggregate.price.value).toBe(12);
    expect(aggregate.discountedPrice.value).toBe(9);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product-variant.price-updated');
  });

  it('compares prices by value, not object identity', () => {
    const aggregate = variant();
    aggregate.clearEvents();

    aggregate.updatePrice(Money.create(10), Money.create(10), id(4));

    expect(aggregate.price.value).toBe(10);
  });

  it('refuses a discount above the new price', () => {
    expect(() => variant().updatePrice(Money.create(5), Money.create(10), id(4))).toThrow(
      BadRequestError,
    );
  });
});

describe('ProductVariantAggregate activation', () => {
  it('deactivates and reactivates exactly once per state', () => {
    const aggregate = variant({ active: true });
    aggregate.clearEvents();

    aggregate.deActivate(id(4));
    expect(aggregate.active).toBe(false);
    expect(() => aggregate.deActivate(id(4))).toThrow('This variant is already inactive.');

    aggregate.activate(id(4));
    expect(aggregate.active).toBe(true);
    expect(() => aggregate.activate(id(4))).toThrow('This variant is already active.');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'product-variant.deactivated',
      'product-variant.activated',
    ]);
  });

  it('starts an inactive variant inactive', () => {
    const aggregate = variant({ active: false });

    expect(aggregate.active).toBe(false);
    expect(() => aggregate.deActivate(id(4))).toThrow(BadRequestError);
  });
});

describe('ProductVariantAggregate metadata', () => {
  it('updates the title with an event', () => {
    const aggregate = variant();
    aggregate.clearEvents();

    aggregate.updateMeta(Title.create('New variant title'), id(4));

    expect(aggregate.title.value).toBe('New variant title');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product-variant.meta-updated');
  });
});

describe('ProductVariantAggregate soft delete and recovery', () => {
  it('deletes once, deactivates and records the deletion', () => {
    const aggregate = variant({ active: true });

    aggregate.deleteProduct(id(9), reason());

    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.active).toBe(false);
    expect(() => aggregate.deleteProduct(id(9), reason())).toThrow(BadRequestError);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product-variant.deleted');
  });

  it('recovers only a deleted variant and makes it sellable again', () => {
    expect(() => variant().recoverProduct(id(9))).toThrow(BadRequestError);

    const aggregate = deletedVariant();
    aggregate.recoverProduct(id(9));

    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.active).toBe(true);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'product-variant.recovered',
    ]);
  });

  it('blocks pricing, activation and metadata changes while deleted', () => {
    const aggregate = deletedVariant();

    expect(() => aggregate.updatePrice(Money.create(11), Money.create(9), id(4))).toThrow(
      BadRequestError,
    );
    expect(() => aggregate.activate(id(4))).toThrow(BadRequestError);
    expect(() => aggregate.deActivate(id(4))).toThrow(BadRequestError);
    expect(() => aggregate.updateMeta(Title.create('New title'), id(4))).toThrow(BadRequestError);
  });
});
