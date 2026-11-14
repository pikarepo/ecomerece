import { describe, expect, it } from 'bun:test';
import {
  AddressAggregate,
  AddressVO,
  CategoryAggregate,
  CityVO,
  ContactInfoVO,
  CountryVO,
  Description,
  DisclaimerVO,
  EmailVO,
  Id,
  ImageInfoVO,
  ImagesVO,
  ImageVO,
  IngredientsVO,
  InventoryAggregate,
  Money,
  NameInfoVO,
  PersonName,
  PhoneNumber,
  PostalCodeVO,
  ProductAggregate,
  ProductVariantAggregate,
  Quantity,
  Reason,
  Slug,
  StateVO,
  StreetAddressVO,
  Title,
  UrlVO,
  UserAggregate,
  VendorAggregate,
  VerificationInfoVO,
} from '@ecomerece/domain';
import { BadRequestError } from '../../errors/app-error';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const actor = id(900);
const reason = () => Reason.create('violates the marketplace policy');
const imageUrl = () => UrlVO.create('https://cdn.example.com/image.png');

function address() {
  return AddressVO.create(
    StreetAddressVO.create('12 Main Street'),
    CityVO.create('Springfield'),
    StateVO.create('Illinois'),
    PostalCodeVO.create('62701'),
    CountryVO.create('USA'),
  );
}

function vendor(deleted = false) {
  const aggregate = VendorAggregate.create({
    id: id(100),
    ownerId: id(4),
    tittle: Title.create('Vendor Shop'),
    description: Description.create('A vendor description.'),
    contacts: ContactInfoVO.create(
      PhoneNumber.create('+123456789'),
      EmailVO.create('vendor@example.com'),
      address(),
    ),
    image: ImageInfoVO.create(imageUrl(), imageUrl()),
    slug: Slug.create('vendor-shop'),
  });

  if (deleted) aggregate.deleteVendor(actor, reason());

  return aggregate;
}

function category() {
  return CategoryAggregate.create({
    id: id(200),
    title: Title.create('Category title'),
    image: imageUrl(),
    createdBy: actor,
  });
}

function user() {
  return UserAggregate.create({
    id: id(7),
    name: NameInfoVO.create(PersonName.create('Jane'), null, PersonName.create('Doe')),
    email: EmailVO.create('jane@example.com'),
    image: imageUrl(),
  });
}

function variant() {
  return ProductVariantAggregate.create({
    id: id(300),
    productId: id(301),
    discountedPrice: Money.create(8),
    price: Money.create(10),
    title: Title.create('Variant title'),
    active: true,
  });
}

function product() {
  return ProductAggregate.create({
    id: id(400),
    vendorId: id(4),
    vendorTitle: Title.create('Vendor Shop'),
    categoryId: id(200),
    images: ImagesVO.create([ImageVO.create(imageUrl(), imageUrl(), true)]),
    title: Title.create('Product title'),
    description: Description.create('A product description.'),
    ingredients: IngredientsVO.create({ isIngredients: false, items: [] }),
    disclaimer: DisclaimerVO.create({ isDisclaimer: false, items: [] }),
  });
}

describe('vendor security rules', () => {
  it('refuses self-verification even with an equal-value Id instance', () => {
    const aggregate = vendor();
    const sameOwner = Id.create(aggregate.ownerId.value);

    expect(() => aggregate.verifyVendor(sameOwner)).toThrow(BadRequestError);
  });

  it('refuses to recover a vendor that was not deleted', () => {
    expect(() => vendor().recoverVendor(actor)).toThrow(BadRequestError);
  });

  it('blocks profile changes on a deleted vendor', () => {
    const aggregate = vendor(true);

    expect(() =>
      aggregate.updatedMeta(
        Title.create('New title'),
        Slug.create('new-slug'),
        Description.create('A new description.'),
      ),
    ).toThrow(BadRequestError);
  });

  it('allows rejecting a pending application but not a second rejection', () => {
    const pending = VerificationInfoVO.pending();
    const rejected = pending.reject(reason());

    expect(rejected.isRejected).toBe(true);
    expect(() => rejected.reject(reason())).toThrow(BadRequestError);
  });
});

describe('category security rules', () => {
  it('refuses a second delete and recovery of an active category', () => {
    const aggregate = category();
    aggregate.deleteCategory(reason(), actor);

    expect(() => aggregate.deleteCategory(reason(), actor)).toThrow(BadRequestError);
    expect(() => category().recoverCategory(actor)).toThrow(BadRequestError);
  });

  it('blocks metadata updates on a deleted category', () => {
    const aggregate = category();
    aggregate.deleteCategory(reason(), actor);

    expect(() => aggregate.updateMeta(Title.create('New title'), actor)).toThrow(BadRequestError);
  });
});

describe('address security rules', () => {
  it('refuses recovery by a non-owner', () => {
    const aggregate = AddressAggregate.create({
      _id: id(500),
      _ownerId: id(7),
      _streetAddress: StreetAddressVO.create('12 Main Street'),
      _city: CityVO.create('Springfield'),
      _state: StateVO.create('Illinois'),
      _postalCode: PostalCodeVO.create('62701'),
      _country: CountryVO.create('USA'),
    });
    aggregate.deleteAddress(reason(), id(7));

    expect(() => aggregate.recoverAddress(id(8))).toThrow(BadRequestError);
    expect(() => aggregate.recoverAddress(Id.create(id(7).value))).not.toThrow();
  });

  it('blocks updates on a deleted address', () => {
    const aggregate = AddressAggregate.create({
      _id: id(501),
      _ownerId: id(7),
      _streetAddress: StreetAddressVO.create('12 Main Street'),
      _city: CityVO.create('Springfield'),
      _state: StateVO.create('Illinois'),
      _postalCode: PostalCodeVO.create('62701'),
      _country: CountryVO.create('USA'),
    });
    aggregate.deleteAddress(reason(), id(7));

    expect(() => aggregate.updateAddress(address(), id(7))).toThrow(BadRequestError);
  });
});

describe('product and variant security rules', () => {
  it('validates the discount by value, not object identity', () => {
    const aggregate = variant();

    expect(() => aggregate.updatePrice(Money.create(5), Money.create(10), actor)).toThrow(
      BadRequestError,
    );
    expect(() => aggregate.updatePrice(Money.create(10), Money.create(5), actor)).not.toThrow();
  });

  it('blocks mutations on deleted variants and products', () => {
    const deletedVariant = variant();
    deletedVariant.deleteProduct(actor, reason());
    expect(() => deletedVariant.updateMeta(Title.create('New title'), actor)).toThrow(
      BadRequestError,
    );

    const deletedProduct = product();
    deletedProduct.deleteProduct(actor, reason());
    expect(() =>
      deletedProduct.updateMeta(
        Title.create('New title'),
        Description.create('A new description.'),
        actor,
      ),
    ).toThrow(BadRequestError);
  });
});

describe('inventory security rules', () => {
  it('refuses deletion while stock remains', () => {
    const aggregate = InventoryAggregate.create({
      id: id(600),
      variantId: id(300),
      lowStockThreshold: Quantity.create(2),
      available: Quantity.create(5),
    });

    expect(() => aggregate.deleteInventory(reason(), actor)).toThrow(BadRequestError);
  });

  it('blocks stock changes after deletion', () => {
    const aggregate = InventoryAggregate.create({
      id: id(601),
      variantId: id(300),
      lowStockThreshold: Quantity.create(2),
      available: Quantity.create(0),
    });
    aggregate.deleteInventory(reason(), actor);

    expect(() => aggregate.reserve(Quantity.create(1), actor)).toThrow(BadRequestError);
    expect(() => aggregate.deleteInventory(reason(), actor)).toThrow(BadRequestError);
  });
});

describe('user security rules', () => {
  it('refuses a sign-in event for another user id', () => {
    expect(() => user().signIn(id(8))).toThrow(BadRequestError);
    expect(() => user().signIn(Id.create(id(7).value))).not.toThrow();
  });
});
