import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import {
  AltVO,
  Description,
  Id,
  ImageVO,
  Money,
  Name,
  Quantity,
  Reason,
  Title,
  UrlVO,
} from '../../value-objects';
import { ProductAggregate } from '../product/product.aggregate';
import { DisclaimerVO } from '../product/value-objects/disclaimer.vo';
import { IngredientsVO } from '../product/value-objects/ingredients.vo';
import { ImagesVO } from '../product/value-objects/product-images.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const url = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);
const image = (name: string, isDefault = false) =>
  ImageVO.create(url(name), AltVO.create('Product photo'), isDefault);

function images(...names: string[]) {
  return ImagesVO.create(names.map((name, index) => image(name, index === 0)));
}

function ingredients(enabled = true) {
  return IngredientsVO.create({ isIngredients: enabled, items: [] });
}

function disclaimer(enabled = true) {
  return DisclaimerVO.create({ isDisclaimer: enabled, items: [] });
}

function product(overrides: { ingredients?: IngredientsVO; disclaimer?: DisclaimerVO } = {}) {
  return ProductAggregate.create({
    id: id(400),
    vendorId: id(4),
    vendorTitle: Title.create('Vendor Shop'),
    categoryId: id(200),
    images: images('one'),
    title: Title.create('Product title'),
    description: Description.create('A product description.'),
    ingredients: overrides.ingredients ?? ingredients(),
    disclaimer: overrides.disclaimer ?? disclaimer(),
  });
}

function deletedProduct() {
  const aggregate = product();
  aggregate.deleteProduct(id(9), reason());
  aggregate.clearEvents();
  return aggregate;
}

describe('ProductAggregate creation', () => {
  it('starts unpublished stock-free with zero summaries', () => {
    const aggregate = product();

    expect(aggregate.inStock).toBe(false);
    expect(aggregate.appearance.isPublic).toBe(true);
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.block.isBlocked).toBe(false);
    expect(aggregate.minPrice.value).toBe(0);
    expect(aggregate.maxPrice.value).toBe(0);
    expect(aggregate.averageRating.value).toBe(0);
    expect(aggregate.totalReviews.value).toBe(0);
    expect(aggregate.version.value).toBe(0);
    expect(aggregate.hasMultipleVariants).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['product.created']);
  });

  it('requires at least one image before a product can exist', () => {
    expect(() => ImagesVO.create([])).toThrow('At least one product image is required.');
  });
});

describe('ProductAggregate metadata and visibility', () => {
  it('updates the title and description with an audit event', () => {
    const aggregate = product();
    aggregate.clearEvents();

    aggregate.updateMeta(
      Title.create('New product title'),
      Description.create('A new description.'),
      id(4),
    );

    expect(aggregate.title.value).toBe('New product title');
    expect(aggregate.description.value).toBe('A new description.');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product.meta-updated');
  });

  it('toggles public and private appearance exactly once per state', () => {
    const aggregate = product();

    aggregate.makeProductPrivate();
    expect(aggregate.appearance.isPrivate).toBe(true);
    expect(() => aggregate.makeProductPrivate()).toThrow(BadRequestError);

    aggregate.makeProductPublic();
    expect(aggregate.appearance.isPublic).toBe(true);
    expect(() => aggregate.makeProductPublic()).toThrow(BadRequestError);
  });

  it('blocks and unblocks exactly once per state', () => {
    const aggregate = product();

    aggregate.blockProduct(id(9), reason());
    expect(aggregate.block.isBlocked).toBe(true);
    expect(aggregate.block.performedBy).toEqual(id(9));
    expect(() => aggregate.blockProduct(id(9), reason())).toThrow(BadRequestError);

    aggregate.unBlockProduct(id(9));
    expect(aggregate.block.isBlocked).toBe(false);
    expect(() => aggregate.unBlockProduct(id(9))).toThrow(BadRequestError);
  });

  it('deletes once and refuses deletion twice', () => {
    const aggregate = product();

    aggregate.deleteProduct(id(9), reason());

    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.delete.reason).toEqual(reason());
    expect(() => aggregate.deleteProduct(id(9), reason())).toThrow(BadRequestError);
  });

  it('recovers only a deleted product', () => {
    expect(() => product().recoverProduct()).toThrow(BadRequestError);

    const aggregate = deletedProduct();
    aggregate.recoverProduct();

    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['product.recovered']);
  });

  it('blocks metadata, visibility, image and ingredient changes while deleted', () => {
    const aggregate = deletedProduct();

    expect(() =>
      aggregate.updateMeta(
        Title.create('New title'),
        Description.create('A new description.'),
        id(4),
      ),
    ).toThrow(BadRequestError);
    expect(() => aggregate.makeProductPublic()).toThrow(BadRequestError);
    expect(() => aggregate.makeProductPrivate()).toThrow(BadRequestError);
    expect(() => aggregate.addImages(image('two'), id(4))).toThrow(BadRequestError);
    expect(() => aggregate.removeImages(url('one'), id(4))).toThrow(BadRequestError);
    expect(() => aggregate.addIngredients('Sugar', id(4))).toThrow(BadRequestError);
    expect(() => aggregate.enableDisclaimer(id(4))).toThrow(BadRequestError);
  });
});

describe('ProductAggregate pricing and ratings', () => {
  it('stores the price range and reports multiple variants by value', () => {
    const aggregate = product();
    aggregate.clearEvents();

    aggregate.updatePricingSummary(
      Money.create(10),
      Money.create(20),
      Money.create(8),
      Money.create(15),
      id(4),
    );

    expect(aggregate.minPrice.value).toBe(10);
    expect(aggregate.maxPrice.value).toBe(20);
    expect(aggregate.minDiscountedPrice.value).toBe(8);
    expect(aggregate.maxDiscountedPrice.value).toBe(15);
    expect(aggregate.hasMultipleVariants).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product.pricing-summary-updated');
  });

  it('treats equal min and max as a single variant even with different objects', () => {
    const aggregate = product();
    aggregate.updatePricingSummary(
      Money.create(10),
      Money.create(10),
      Money.create(5),
      Money.create(5),
    );

    expect(aggregate.hasMultipleVariants).toBe(false);
  });

  it('rounds the average rating to one decimal', () => {
    const aggregate = product();

    aggregate.updateRatingSummary(4.26, 12);

    expect(aggregate.averageRating.value).toBe(4.3);
    expect(aggregate.totalReviews.value).toBe(12);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product.rating-summary-updated');
  });

  it('accepts the rating bounds and rejects values outside 0..5', () => {
    const aggregate = product();
    aggregate.updateRatingSummary(0, 0);
    expect(aggregate.averageRating.value).toBe(0);
    aggregate.updateRatingSummary(5, 1);
    expect(aggregate.averageRating.value).toBe(5);

    expect(() => aggregate.updateRatingSummary(-0.1, 1)).toThrow(BadRequestError);
    expect(() => aggregate.updateRatingSummary(5.1, 1)).toThrow(BadRequestError);
    expect(() => aggregate.updateRatingSummary(3, -1)).toThrow(BadRequestError);
  });
});

describe('ProductAggregate images', () => {
  it('adds a single image or many and reports the count', () => {
    const aggregate = product();

    aggregate.addImages(image('two'), id(4));
    aggregate.addImages([image('three'), image('four')], id(4));

    expect(aggregate.getImagesCount()).toBe(4);
    expect(aggregate.hasImages()).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product.images-added');
  });

  it('removes images by value and refuses to remove the last one', () => {
    const aggregate = product();
    aggregate.addImages(image('two'), id(4));

    aggregate.removeImages(url('one'), id(4));
    expect(aggregate.getImagesCount()).toBe(1);
    expect(aggregate.hasImage(url('one'))).toBe(false);

    expect(() => aggregate.removeImages(url('two'), id(4))).toThrow(BadRequestError);
  });

  it('moves the default image and refuses an out-of-range index', () => {
    const aggregate = product();
    aggregate.addImages(image('two'), id(4));

    aggregate.setDefault(Quantity.create(1), id(4));

    expect(aggregate.getDefaultImage()?.url.value).toBe(url('two').value);
    expect(aggregate.getFirstImage()?.url.value).toBe(url('one').value);
    expect(aggregate.getLastImage()?.url.value).toBe(url('two').value);
    expect(() => aggregate.setDefault(Quantity.create(2), id(4))).toThrow(BadRequestError);
  });
});

describe('ProductAggregate ingredients', () => {
  it('adds, reports and removes ingredients', () => {
    const aggregate = product();
    aggregate.clearEvents();

    aggregate.addIngredients(['Sugar', 'Salt'], id(4));

    expect(aggregate.hasIngredient('Sugar')).toBe(true);
    expect(aggregate.ingredients.length).toBe(2);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('product.ingredients-added');

    aggregate.removeIngredients('Sugar', id(4));
    expect(aggregate.hasIngredient('Sugar')).toBe(false);
  });

  it('skips blank ingredient names instead of adding them', () => {
    const aggregate = product();
    aggregate.addIngredients(['   ', 'Sugar'], id(4));

    expect(aggregate.ingredients.length).toBe(1);
    expect(aggregate.pullEvents().at(-1)?.payload).toMatchObject({ items: ['Sugar'] });
  });

  it('refuses duplicate ingredients', () => {
    const aggregate = product();
    aggregate.addIngredients('Sugar', id(4));

    expect(() => aggregate.addIngredients('Sugar', id(4))).toThrow(BadRequestError);
  });

  it('refuses ingredient changes while the list is disabled', () => {
    const aggregate = product({ ingredients: ingredients(false) });

    expect(() => aggregate.addIngredients('Sugar', id(4))).toThrow('Ingredients are disabled.');
  });

  it('clears and re-enables the list', () => {
    const aggregate = product();
    aggregate.addIngredients(['Sugar', 'Salt'], id(4));
    aggregate.clearIngredients(id(4));
    expect(aggregate.ingredients.isEmpty).toBe(true);

    aggregate.disableIngredients(id(4));
    expect(aggregate.ingredients.isIngredients).toBe(false);
    aggregate.enableIngredients(id(4));
    expect(aggregate.ingredients.isIngredients).toBe(true);
  });
});

describe('ProductAggregate disclaimers', () => {
  const item = (name: string) => ({ name, title: 'Contains allergen' });

  it('adds, updates and removes disclaimers', () => {
    const aggregate = product();
    aggregate.clearEvents();

    aggregate.addDisclaimers([item('Peanuts')], id(4));
    expect(aggregate.disclaimer.items).toHaveLength(1);
    expect(aggregate.disclaimer.has('Peanuts')).toBe(true);

    aggregate.updateDisclaimer(Name.create('Peanuts'), Title.create('May contain peanuts'), id(4));
    expect(aggregate.disclaimer.items[0]?.title.value).toBe('May contain peanuts');

    aggregate.removeDisclaimers([item('Peanuts')], id(4));
    expect(aggregate.disclaimer.items).toHaveLength(0);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'product.disclaimers-added',
      'product.disclaimer-updated',
      'product.disclaimers-removed',
    ]);
  });

  it('refuses duplicate disclaimers', () => {
    const aggregate = product();
    aggregate.addDisclaimers([item('Peanuts')], id(4));

    expect(() => aggregate.addDisclaimers([item('Peanuts')], id(4))).toThrow(BadRequestError);
  });

  it('refuses changes while disclaimers are disabled', () => {
    const aggregate = product({ disclaimer: disclaimer(false) });

    expect(() => aggregate.addDisclaimers([item('Peanuts')], id(4))).toThrow(
      'Disclaimer is disabled.',
    );
  });

  it('clears items when disabled and keeps them when only flag changes', () => {
    const aggregate = product();
    aggregate.addDisclaimers([item('Peanuts')], id(4));

    aggregate.disableDisclaimer(id(4));
    expect(aggregate.disclaimer.isDisclaimer).toBe(false);
    expect(aggregate.disclaimer.items).toHaveLength(0);

    aggregate.enableDisclaimer(id(4));
    expect(aggregate.disclaimer.isDisclaimer).toBe(true);
  });
});

describe('ProductAggregate stock flag', () => {
  it('records the in-stock flag and its event', () => {
    const aggregate = product();
    aggregate.clearEvents();

    aggregate.setInStock(true, id(4));

    expect(aggregate.inStock).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.payload).toMatchObject({ inStock: true, actorId: id(4) });
  });
});
