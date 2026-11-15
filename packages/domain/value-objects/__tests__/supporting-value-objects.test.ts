import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { CartItemVO } from '../../modules/cart/value-objects/cart-item.vo';
import { OrderItem } from '../../modules/order/value-objects/order-item.vo';
import { ContactInfoVO } from '../../modules/vendor/value-objects/contact-info.vo';
import { ImageInfoVO } from '../../modules/vendor/value-objects/image-info.vo';
import { VerificationInfoVO } from '../../modules/vendor/value-objects/verification-info.vo';
import { NameInfoVO } from '../../modules/user/value-objects/name-info.vo';
import { RoleInfoVO, UserRoleVO } from '../../modules/user/value-objects/role-info.vo';
import { AppearanceVO } from '../appearance.vo';
import { BanInfoVO } from '../ban-info.vo';
import { BlockInfoVO } from '../block-info.vo';
import { ColorVO } from '../color.vo';
import { DeleteInfoVO } from '../delete-info.vo';
import { EffectiveDate } from '../effective-date.vo';
import { EmailVO } from '../email.vo';
import { ExpirationDate } from '../expiration-date.vo';
import { IconVO } from '../icon.vo';
import { Id } from '../id.vo';
import { ImageKey } from '../image-key.vo';
import { Money } from '../money.vo';
import { Name, PersonName } from '../name.vo';
import { Percentage } from '../percentage.vo';
import { PhoneNumber } from '../phone-no.vo';
import { Quantity } from '../quantity.vo';
import { BaseQueryVO } from '../query.vo';
import { Reason } from '../reason.vo';
import { Slug } from '../slug.vo';
import {
  AddressVO,
  CityVO,
  CountryVO,
  PostalCodeVO,
  StateVO,
  StreetAddressVO,
} from '../street-address.vo';
import { Title } from '../title.vo';
import { UrlVO } from '../url.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const url = (name: string) => UrlVO.create(`https://cdn.example.com/${name}.png`);

function address() {
  return AddressVO.create(
    StreetAddressVO.create('12 Main Street'),
    CityVO.create('Springfield'),
    StateVO.create('Illinois'),
    PostalCodeVO.create('62701'),
    CountryVO.create('USA'),
  );
}

describe('StringVO-based helpers', () => {
  it('compares, slices and transforms by value', () => {
    const title = Title.create('Product title');

    expect(title.equals(Title.create('Product title'))).toBe(true);
    expect(title.equals(Title.create('Other title'))).toBe(false);
    expect(title.contains('duct')).toBe(true);
    expect(title.startsWith('Product')).toBe(true);
    expect(title.endsWith('title')).toBe(true);
    expect(title.length).toBe(13);
    expect(title.isEmpty).toBe(false);
    expect(title.toLower()).toBe('product title');
    expect(title.toUpper()).toBe('PRODUCT TITLE');
    expect(title.trim()).toBe('Product title');
    expect(title.toString()).toBe('Product title');
    expect(String(title)).toBe('Product title');
  });
});

describe('Slug', () => {
  it('normalizes case and padding and exposes its segments', () => {
    const slug = Slug.create('  Electronics-Phones  ');

    expect(slug.value).toBe('electronics-phones');
    expect(slug.segments).toEqual(['electronics', 'phones']);
    expect(slug.firstSegment).toBe('electronics');
    expect(slug.lastSegment).toBe('phones');
    expect(slug.segmentCount).toBe(2);
    expect(slug.startsWithSegment('ELECTRONICS')).toBe(true);
    expect(slug.endsWithSegment('Phones')).toBe(true);
    expect(slug.containsSegment('phones')).toBe(true);
    expect(slug.toPath()).toBe('/electronics/phones');
  });

  it('rejects spaces, punctuation and empty segments', () => {
    expect(() => Slug.create('electronics phones')).toThrow(BadRequestError);
    expect(() => Slug.create('electronics--phones')).toThrow(BadRequestError);
    expect(() => Slug.create('-electronics')).toThrow(BadRequestError);
    expect(() => Slug.create('electronics_phones')).toThrow(BadRequestError);
  });

  it('supports append, prepend, parent, child and segment replacement', () => {
    const slug = Slug.create('electronics-phones');

    expect(slug.append('cases').value).toBe('electronics-phones-cases');
    expect(slug.prepend('store').value).toBe('store-electronics-phones');
    expect(slug.parent()?.value).toBe('electronics');
    expect(slug.child('cases').value).toBe('electronics-phones-cases');
    expect(slug.replaceSegment('phones', 'tablets').value).toBe('electronics-tablets');
    expect(Slug.create('electronics').parent()).toBeNull();
  });
});

describe('numeric value objects', () => {
  it('applies and complements percentages', () => {
    expect(Percentage.create(25).apply(200)).toBe(50);
    expect(Percentage.create(30).remainder.value).toBe(70);
    expect(Percentage.create(0).remainder.value).toBe(100);
    expect(() => Percentage.create(-1)).toThrow(BadRequestError);
    expect(() => Percentage.create(101)).toThrow(BadRequestError);
  });

  it('supports money addition, subtraction and multiplication', () => {
    expect(Money.create(10).addMoney(Money.create(5)).value).toBe(15);
    expect(Money.create(10).subtractMoney(Money.create(5)).value).toBe(5);
    expect(() => Money.create(10).subtractMoney(Money.create(15))).toThrow(BadRequestError);
    expect(Money.create(10).times(3).value).toBe(30);
    expect(Money.zero().isZero).toBe(true);
  });

  it('exposes quantity zero and positivity flags', () => {
    expect(Quantity.none().isZero).toBe(true);
    expect(Quantity.create(1).isPositive).toBe(true);
    expect(Quantity.create(0).isPositive).toBe(false);
    expect(Quantity.create(5).increase(2).value).toBe(7);
  });
});

describe('AppearanceVO and IconVO', () => {
  it('normalizes appearance and toggles visibility', () => {
    const appearance = AppearanceVO.create('PUBLIC');

    expect(appearance.value).toBe('public');
    expect(appearance.isPublic).toBe(true);
    expect(appearance.isPrivate).toBe(false);
    expect(appearance.makePrivate().isPrivate).toBe(true);
    expect(appearance.makePrivate().makePublic().isPublic).toBe(true);
    expect(() => AppearanceVO.create('hidden')).toThrow(BadRequestError);
  });

  it('trims icon names, rejects empty names and compares by value', () => {
    expect(IconVO.create('  Box  ').name).toBe('Box');
    expect(IconVO.create('Box').equals(IconVO.create('Box'))).toBe(true);
    expect(IconVO.create('Box').equals(IconVO.create('Cart'))).toBe(false);
    expect(() => IconVO.create('   ')).toThrow(BadRequestError);
  });
});

describe('BaseQueryVO', () => {
  it('applies defaults and clamps the limit into 1..100', () => {
    expect(BaseQueryVO.create({})).toMatchObject({ cursor: null, direction: 'next', sort: null });
    expect(BaseQueryVO.create({}).limit.value).toBe(20);
    expect(BaseQueryVO.create({ limit: Quantity.create(0) }).limit.value).toBe(1);
    expect(BaseQueryVO.create({ limit: Quantity.create(500) }).limit.value).toBe(100);
  });

  it('serializes pagination params and omits empty optional fields', () => {
    const query = BaseQueryVO.create({ filter: { active: true }, limit: Quantity.create(10) });

    expect(query.toPaginationParams()).toEqual({
      filter: { active: true },
      limit: 10,
      direction: 'next',
    });

    const full = BaseQueryVO.create({
      cursor: 'cursor-1',
      limit: Quantity.create(5),
      direction: 'prev',
      sort: { createdAt: -1 },
    });
    expect(full.toPaginationParams()).toEqual({
      filter: {},
      cursor: 'cursor-1',
      limit: 5,
      direction: 'prev',
      sort: { createdAt: -1 },
    });
  });
});

describe('ImageKey', () => {
  it('normalizes folders and exposes folder, file name and extension', () => {
    const key = ImageKey.create(['products', 'images'], 'photo.PNG');

    expect(key.value).toBe('products/images/photo.PNG');
    expect(key.folder).toBe('products/images');
    expect(key.fileName).toBe('photo.PNG');
    expect(key.extension).toBe('png');
    expect(key.toString()).toBe('products/images/photo.PNG');
    expect(key.equals('products/images/photo.PNG')).toBe(true);
    expect(key.equals(ImageKey.create('products', 'other.png'))).toBe(false);
  });

  it('rejects empty, absolute, traversal and control-character keys', () => {
    expect(() => ImageKey.rehydrate('')).toThrow();
    expect(() => ImageKey.rehydrate('/abs/path.png')).toThrow();
    expect(() => ImageKey.rehydrate('a/../../b.png')).toThrow();
    expect(() => ImageKey.rehydrate('a/\u0001.png')).toThrow();
    expect(() => ImageKey.rehydrate('a'.repeat(1100))).toThrow();
  });

  it('moves keys between folders and adds suffixes before the extension', () => {
    const key = ImageKey.create('products', 'photo.jpg');

    expect(key.inFolder('archive').value).toBe('archive/products/photo.jpg');
    expect(key.withSuffix('_thumb').value).toBe('products/photo_thumb.jpg');
    expect(key.withSuffix('   ')).toBe(key);
    expect(ImageKey.rehydrate('products/photo').withSuffix('_v2').value).toBe('products/photo_v2');
  });

  it('reports no extension for extensionless names', () => {
    expect(ImageKey.rehydrate('products/photo').extension).toBeNull();
    expect(ImageKey.rehydrate('products/.gitkeep').extension).toBeNull();
  });
});

describe('name value objects', () => {
  it('builds a full name while skipping a missing middle name', () => {
    const info = NameInfoVO.create(PersonName.create('Jane'), null, PersonName.create('Doe'));

    expect(info.firstName.value).toBe('Jane');
    expect(info.middleName).toBeNull();
    expect(info.lastName?.value).toBe('Doe');
    expect(info.fullName).toBe('Jane Doe');
  });

  it('rejects spaces, digits and empty person names', () => {
    expect(() => PersonName.create('Jane Doe')).toThrow(BadRequestError);
    expect(() => PersonName.create('Jane1')).toThrow(BadRequestError);
    expect(() => PersonName.create('')).toThrow(BadRequestError);
    expect(Name.create("O'Brien").value).toBe("O'Brien");
    expect(Name.create('Anne-Marie').value).toBe('Anne-Marie');
  });
});

describe('role and verification value objects', () => {
  it('reports role flags and explicit assignment metadata', () => {
    expect(RoleInfoVO.none().isCustomer).toBe(true);
    expect(RoleInfoVO.none().isSystemAssigned).toBe(true);
    expect(RoleInfoVO.system(UserRoleVO.create('admin')).isAdmin).toBe(true);

    const assigned = RoleInfoVO.assigned(
      UserRoleVO.create('vendor'),
      EffectiveDate.today(),
      id(9),
      reason(),
    );
    expect(assigned.isVendor).toBe(true);
    expect(assigned.isSystemAssigned).toBe(false);
    expect(assigned.performedBy).toEqual(id(9));
  });

  it('walks the verification state machine', () => {
    const pending = VerificationInfoVO.pending();
    expect(pending.isPending).toBe(true);

    const verified = pending.verify(EffectiveDate.today());
    expect(verified.isVerified).toBe(true);
    expect(verified.verifiedAt).not.toBeNull();
    expect(() => verified.verify(EffectiveDate.today())).toThrow(BadRequestError);

    const rejected = pending.reject(reason());
    expect(rejected.isRejected).toBe(true);
    expect(rejected.rejectedReason).toEqual(reason());
    expect(() => rejected.reject(reason())).toThrow(BadRequestError);

    expect(verified.reset().isPending).toBe(true);
  });
});

describe('vendor and vendor contact value objects', () => {
  it('replaces contact fields individually', () => {
    const contacts = ContactInfoVO.create(
      PhoneNumber.create('+123456789'),
      EmailVO.create('vendor@example.com'),
      address(),
    );

    expect(contacts.changePhone(PhoneNumber.create('+987654321')).phone.value).toBe('+987654321');
    expect(contacts.changeEmail(EmailVO.create('new@example.com')).email.value).toBe(
      'new@example.com',
    );
  });

  it('changes logo and banner keys without losing the other image', () => {
    const image = ImageInfoVO.create(url('logo'), url('banner'));
    const changed = image.changeLogo(url('new-logo'), 'new-logo-key');

    expect(changed.logo.value).toBe(url('new-logo').value);
    expect(changed.banner.value).toBe(url('banner').value);
    expect(changed.logoKey).toBe('new-logo-key');
    expect(image.changeBanner(url('new-banner'), 'banner-key').bannerKey).toBe('banner-key');
    expect(changed.equals(ImageInfoVO.create(url('new-logo'), url('banner'), 'new-logo-key'))).toBe(
      true,
    );
  });
});

describe('date value objects', () => {
  it('moves effective dates backward and rejects future dates', () => {
    const today = EffectiveDate.today();
    expect(today.subtractDays(1).value.getTime()).toBeLessThan(today.value.getTime());
    expect(EffectiveDate.fromDaysAgo(0).value.getTime()).toBeLessThanOrEqual(Date.now());
    expect(() => EffectiveDate.create(new Date(Date.now() + 60_000))).toThrow(BadRequestError);
    expect(today.isFuture).toBe(false);
    // today() can land on the current millisecond, so only a past day is strictly past.
    expect(EffectiveDate.fromDaysAgo(1).isPast).toBe(true);
  });

  it('validates expiration windows and remaining time', () => {
    const inThreeDays = ExpirationDate.fromDays(3);

    expect(inThreeDays.remainingDays).toBeGreaterThanOrEqual(2);
    expect(inThreeDays.addDays(1).value.getTime()).toBeGreaterThan(inThreeDays.value.getTime());
    expect(inThreeDays.subtractDays(1).value.getTime()).toBeLessThan(inThreeDays.value.getTime());
    expect(ExpirationDate.fromHours(2).isFuture).toBe(true);
    expect(() => ExpirationDate.fromDays(0)).toThrow(BadRequestError);
    expect(() => ExpirationDate.create(new Date(Date.now() - 60_000))).toThrow(BadRequestError);
  });

  it('does not let a caller mutate the stored date', () => {
    const date = EffectiveDate.today();
    const before = date.value.getTime();

    date.value.setFullYear(1999);

    expect(date.value.getTime()).toBe(before);
  });
});

describe('ban and block value objects', () => {
  it('extends and shortens a ban window', () => {
    const ban = BanInfoVO.create(
      id(9),
      EffectiveDate.today(),
      ExpirationDate.fromDays(3),
      reason(),
    );
    const before = ban.until?.remainingDays ?? 0;

    const extended = ban.extend(2);
    expect(extended.until?.remainingDays).toBeGreaterThan(before);

    const shortened = ban.shorten(1);
    expect(shortened.until?.remainingDays).toBeLessThan(before);
    expect(() => ban.shorten(10)).toThrow(BadRequestError);
    expect(() => ban.extend(0)).toThrow(BadRequestError);
    expect(() => BanInfoVO.none().extend(1)).toThrow(BadRequestError);
  });

  it('treats a ban as active only while it ends in the future', () => {
    const active = BanInfoVO.create(
      id(9),
      EffectiveDate.today(),
      ExpirationDate.fromDays(1),
      reason(),
    );
    const expired = BanInfoVO.rehydrate(
      id(9),
      EffectiveDate.fromDaysAgo(5),
      ExpirationDate.rehydrate(new Date(Date.now() - 60_000)),
      reason(),
    );

    expect(active.isBan).toBe(true);
    expect(expired.isBan).toBe(false);
    expect(BanInfoVO.none().isBan).toBe(false);
  });

  it('requires an actor and reason for block and delete information', () => {
    expect(BlockInfoVO.create(id(9), reason()).isBlocked).toBe(true);
    expect(() => BlockInfoVO.create(null, reason())).toThrow(BadRequestError);
    expect(() => BlockInfoVO.create(id(9), null)).toThrow(BadRequestError);

    expect(DeleteInfoVO.create(id(9), reason()).isDeleted).toBe(true);
    expect(DeleteInfoVO.create(id(9), reason()).performedBy).toEqual(id(9));
    expect(DeleteInfoVO.none().isDeleted).toBe(false);
  });
});

describe('order and cart item value objects', () => {
  it('computes an order item total from unit price and quantity', () => {
    const item = OrderItem.create({
      variantId: id(301),
      quantity: Quantity.create(3),
      unitPrice: Quantity.create(4),
    });

    expect(item.totalPrice.value).toBe(12);
    expect(item.variantId).toEqual(id(301));
    expect(item.quantity.value).toBe(3);
  });

  it('requires a positive cart quantity and accumulates additions', () => {
    expect(() => CartItemVO.create(id(301), Quantity.none())).toThrow(BadRequestError);

    const item = CartItemVO.create(id(301), Quantity.create(1));
    const added = item.addQuantity(Quantity.create(2));

    expect(added.quantity.value).toBe(3);
    expect(added.id).toEqual(item.id);
    expect(added.variantId).toEqual(item.variantId);
  });
});

describe('ColorVO and UrlVO helpers', () => {
  it('compares colors case-insensitively and rejects invalid hex', () => {
    expect(ColorVO.create('#aabbcc').equals(ColorVO.create('#AABBCC'))).toBe(true);
    expect(() => ColorVO.create('blue')).toThrow(BadRequestError);
  });

  it('exposes the hostname and https flag of a url', () => {
    expect(url('image').hostname).toBe('cdn.example.com');
    expect(url('image').isHttps).toBe(true);
    expect(() => UrlVO.create('http://')).toThrow(BadRequestError);
  });
});
