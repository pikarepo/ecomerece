import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { BaseQueryVO, ColorVO, Description, Id, Quantity, Title, UrlVO } from '../../value-objects';
import { HomeAggregate } from '../home/home.aggregate';
import { CategoryVO } from '../home/value-objects/category.vo';
import { FeatureVO } from '../home/value-objects/feature.vo';
import { ProductContainerVO } from '../home/value-objects/product-container.vo';
import { PromoVO } from '../home/value-objects/promo.vo';
import { SlideVO } from '../home/value-objects/slide.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const accent = () => ColorVO.create('#FFAA00');
const url = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);

function home() {
  return HomeAggregate.create(id(1));
}

function category(n: number, name = `Category ${n}`) {
  return CategoryVO.create({
    id: id(n),
    name: Title.create(name),
    image: url(`category-${n}`),
    accent: accent(),
  });
}

function feature(n: number, title = `Feature ${n}`) {
  return FeatureVO.create({
    id: id(1000 + n),
    title: Title.create(title),
    detail: Description.create('A detailed feature description.'),
    accent: accent(),
  });
}

function slide(n: number) {
  return SlideVO.create({
    id: id(2000 + n),
    tag: Title.create('New arrival'),
    title: Title.create(`Slide title ${n}`),
    subhead: Title.create('Fresh picks'),
    subtitle: Title.create('Shop the season'),
    cta: Title.create('Shop now'),
    image: url(`slide-${n}`),
    accent: accent(),
  });
}

function promo(n: number) {
  return PromoVO.create({
    id: id(3000 + n),
    title: Title.create(`Promo ${n}`),
    subtitle: Title.create('Limited offer'),
    image: url(`promo-${n}`),
    accent: accent(),
  });
}

function container(n: number) {
  return ProductContainerVO.create({
    id: id(4000 + n),
    heading: Title.create(`Section ${n}`),
    subTitle: Title.create('Curated for you'),
    query: BaseQueryVO.create({}),
    displayOrder: Quantity.create(99),
  });
}

describe('HomeAggregate creation and versioning', () => {
  it('starts with empty collections', () => {
    const aggregate = home();

    expect(aggregate.categories).toEqual([]);
    expect(aggregate.features).toEqual([]);
    expect(aggregate.slides).toEqual([]);
    expect(aggregate.promos).toEqual([]);
    expect(aggregate.productContainers).toEqual([]);
    expect(aggregate.version.value).toBe(0);
  });

  it('increments its version and refreshes the update date', () => {
    const aggregate = home();
    const before = aggregate.updatedAt.value.getTime();

    aggregate.incrementVersion();

    expect(aggregate.version.value).toBe(1);
    expect(aggregate.updatedAt.value.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('HomeAggregate categories', () => {
  it('adds and removes categories with events', () => {
    const aggregate = home();

    aggregate.addCategory(category(1));
    expect(aggregate.categories).toHaveLength(1);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['home.category-added']);

    aggregate.removeCategory(id(1));
    expect(aggregate.categories).toEqual([]);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['home.category-removed']);
  });

  it('refuses duplicate ids and case-insensitive duplicate names', () => {
    const aggregate = home();
    aggregate.addCategory(category(1, 'Electronics'));

    expect(() => aggregate.addCategory(category(1, 'Other'))).toThrow(BadRequestError);
    expect(() => aggregate.addCategory(category(2, 'electronics'))).toThrow(BadRequestError);
  });

  it('enforces the category limit', () => {
    const aggregate = home();
    for (let n = 1; n <= HomeAggregate.MAX_CATEGORIES; n += 1) {
      aggregate.addCategory(category(n));
    }

    expect(aggregate.categories).toHaveLength(HomeAggregate.MAX_CATEGORIES);
    expect(() => aggregate.addCategory(category(99))).toThrow(BadRequestError);
  });

  it('updates a category, refusing a missing id or duplicate name', () => {
    const aggregate = home();
    aggregate.addCategory(category(1, 'Electronics'));
    aggregate.addCategory(category(2, 'Books'));
    aggregate.clearEvents();

    aggregate.updateCategory(id(2), category(2, 'Media'));
    expect(aggregate.categories[1]?.name.value).toBe('Media');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['home.category-updated']);

    expect(() => aggregate.updateCategory(id(3), category(3, 'Other'))).toThrow(BadRequestError);
    expect(() => aggregate.updateCategory(id(2), category(2, 'electronics'))).toThrow(
      BadRequestError,
    );
  });

  it('refuses removing a missing category', () => {
    expect(() => home().removeCategory(id(9))).toThrow(BadRequestError);
  });

  it('reorders categories by the supplied id order', () => {
    const aggregate = home();
    aggregate.addCategory(category(1));
    aggregate.addCategory(category(2));
    aggregate.addCategory(category(3));
    aggregate.clearEvents();

    aggregate.reorderCategories([id(3), id(1), id(2)]);

    expect(aggregate.categories.map((item) => item.id.value)).toEqual([
      id(3).value,
      id(1).value,
      id(2).value,
    ]);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'home.categories-reordered',
    ]);
  });

  it('refuses a reorder with the wrong length, duplicates or unknown ids', () => {
    const aggregate = home();
    aggregate.addCategory(category(1));
    aggregate.addCategory(category(2));

    expect(() => aggregate.reorderCategories([id(1)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderCategories([id(1), id(1)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderCategories([id(1), id(9)])).toThrow(BadRequestError);
  });
});

describe('HomeAggregate features', () => {
  it('adds, updates and removes features', () => {
    const aggregate = home();

    aggregate.addFeature(feature(1));
    aggregate.updateFeature(id(1001), feature(1, 'Updated feature'));
    aggregate.removeFeature(id(1001));

    expect(aggregate.features).toEqual([]);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'home.feature-added',
      'home.feature-updated',
      'home.feature-removed',
    ]);
  });

  it('refuses duplicate feature ids and missing ids', () => {
    const aggregate = home();
    aggregate.addFeature(feature(1));

    expect(() => aggregate.addFeature(feature(1))).toThrow(BadRequestError);
    expect(() => aggregate.updateFeature(id(9999), feature(2))).toThrow(BadRequestError);
    expect(() => aggregate.removeFeature(id(9999))).toThrow(BadRequestError);
  });

  it('replaces the feature list and validates its size and ids', () => {
    const aggregate = home();

    aggregate.setFeatures([feature(1), feature(2)]);
    expect(aggregate.features).toHaveLength(2);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['home.features-set']);

    expect(() => aggregate.setFeatures([feature(1), feature(1)])).toThrow(BadRequestError);
    expect(() =>
      aggregate.setFeatures(Array.from({ length: 9 }, (_, index) => feature(index + 1))),
    ).toThrow(BadRequestError);
  });
});

describe('HomeAggregate slides', () => {
  it('assigns display order on add and returns slides sorted by it', () => {
    const aggregate = home();

    aggregate.addSlide(slide(1));
    aggregate.addSlide(slide(2));

    expect(aggregate.slides.map((item) => item.id.value)).toEqual([id(2001).value, id(2002).value]);
    expect(aggregate.slides.map((item) => item.displayOrder.value)).toEqual([0, 1]);
  });

  it('preserves the existing display order on update', () => {
    const aggregate = home();
    aggregate.addSlide(slide(1));
    aggregate.addSlide(slide(2));

    aggregate.updateSlide(id(2002), slide(2));

    expect(aggregate.slides[1]?.displayOrder.value).toBe(1);
  });

  it('normalizes display order after removal', () => {
    const aggregate = home();
    aggregate.addSlide(slide(1));
    aggregate.addSlide(slide(2));
    aggregate.addSlide(slide(3));

    aggregate.removeSlide(id(2001));

    expect(aggregate.slides.map((item) => item.id.value)).toEqual([id(2002).value, id(2003).value]);
    expect(aggregate.slides.map((item) => item.displayOrder.value)).toEqual([0, 1]);
  });

  it('reorders slides and validates the request', () => {
    const aggregate = home();
    aggregate.addSlide(slide(1));
    aggregate.addSlide(slide(2));
    aggregate.addSlide(slide(3));

    aggregate.reorderSlides([id(2003), id(2002), id(2001)]);

    expect(aggregate.slides.map((item) => item.id.value)).toEqual([
      id(2003).value,
      id(2002).value,
      id(2001).value,
    ]);
    expect(aggregate.slides.map((item) => item.displayOrder.value)).toEqual([0, 1, 2]);

    expect(() => aggregate.reorderSlides([id(2001)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderSlides([id(2001), id(2002), id(2002)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderSlides([id(2001), id(2002), id(9999)])).toThrow(BadRequestError);
  });

  it('enforces the slide limit and duplicate ids', () => {
    const aggregate = home();
    for (let n = 1; n <= HomeAggregate.MAX_SLIDES; n += 1) {
      aggregate.addSlide(slide(n));
    }

    expect(() => aggregate.addSlide(slide(99))).toThrow(BadRequestError);
    expect(() => home().updateSlide(id(2001), slide(1))).toThrow(BadRequestError);
    expect(() => home().removeSlide(id(2001))).toThrow(BadRequestError);
  });
});

describe('HomeAggregate promos', () => {
  it('adds, updates and removes promos', () => {
    const aggregate = home();

    aggregate.addPromo(promo(1));
    aggregate.updatePromo(id(3001), promo(1));
    aggregate.removePromo(id(3001));

    expect(aggregate.promos).toEqual([]);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'home.promo-added',
      'home.promo-updated',
      'home.promo-removed',
    ]);
  });

  it('refuses duplicate promos, missing ids and exceeding the limit', () => {
    const aggregate = home();
    aggregate.addPromo(promo(1));

    expect(() => aggregate.addPromo(promo(1))).toThrow(BadRequestError);
    expect(() => aggregate.updatePromo(id(9999), promo(2))).toThrow(BadRequestError);
    expect(() => aggregate.removePromo(id(9999))).toThrow(BadRequestError);

    for (let n = 2; n <= HomeAggregate.MAX_PROMOS; n += 1) {
      aggregate.addPromo(promo(n));
    }
    expect(() => aggregate.addPromo(promo(99))).toThrow(BadRequestError);
  });
});

describe('HomeAggregate product containers', () => {
  it('assigns display order on add and keeps it on update', () => {
    const aggregate = home();

    aggregate.addProductContainer(container(1));
    aggregate.addProductContainer(container(2));
    aggregate.updateProductContainer(container(2));

    expect(aggregate.productContainers.map((item) => item.displayOrder.value)).toEqual([0, 1]);
  });

  it('normalizes display order after removal and reorder', () => {
    const aggregate = home();
    aggregate.addProductContainer(container(1));
    aggregate.addProductContainer(container(2));
    aggregate.addProductContainer(container(3));

    aggregate.removeProductContainer(id(4001));
    expect(aggregate.productContainers.map((item) => item.displayOrder.value)).toEqual([0, 1]);

    aggregate.reorderProductContainers([id(4003), id(4002)]);
    expect(aggregate.productContainers.map((item) => item.id.value)).toEqual([
      id(4003).value,
      id(4002).value,
    ]);
    expect(aggregate.productContainers.map((item) => item.displayOrder.value)).toEqual([0, 1]);
  });

  it('refuses invalid container operations and exceeding the limit', () => {
    const aggregate = home();
    aggregate.addProductContainer(container(1));
    aggregate.addProductContainer(container(2));

    expect(() => aggregate.addProductContainer(container(1))).toThrow(BadRequestError);
    expect(() => aggregate.updateProductContainer(container(999))).toThrow(BadRequestError);
    expect(() => aggregate.removeProductContainer(id(999))).toThrow(BadRequestError);
    expect(() => aggregate.reorderProductContainers([id(4001)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderProductContainers([id(4001), id(4001)])).toThrow(BadRequestError);
    expect(() => aggregate.reorderProductContainers([id(4001), id(9999)])).toThrow(BadRequestError);

    for (let n = 3; n <= HomeAggregate.MAX_PRODUCT_CONTAINERS; n += 1) {
      aggregate.addProductContainer(container(n));
    }
    expect(() => aggregate.addProductContainer(container(99))).toThrow(BadRequestError);
  });
});
