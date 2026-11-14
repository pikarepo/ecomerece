import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { ImagesVO } from '../../modules/product/value-objects/product-images.vo';
import { AltVO } from '../alt.vo';
import { BanInfoVO } from '../ban-info.vo';
import { BlockInfoVO } from '../block-info.vo';
import { ColorVO } from '../color.vo';
import { EffectiveDate } from '../effective-date.vo';
import { EmailVO } from '../email.vo';
import { ExpirationDate } from '../expiration-date.vo';
import { Id } from '../id.vo';
import { ImageVO } from '../image.vo';
import { Money } from '../money.vo';
import { Percentage } from '../percentage.vo';
import { Quantity } from '../quantity.vo';
import { Reason } from '../reason.vo';
import { StreetAddressVO } from '../street-address.vo';
import { Title } from '../title.vo';
import { UrlVO } from '../url.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('spamming the marketplace');

describe('number value objects', () => {
  it('rejects NaN and Infinity for money, quantity and percentage', () => {
    expect(() => Money.create(Number.NaN)).toThrow(BadRequestError);
    expect(() => Money.create(Number.POSITIVE_INFINITY)).toThrow(BadRequestError);
    expect(() => Quantity.create(Number.NaN)).toThrow(BadRequestError);
    expect(() => Quantity.create(Number.NEGATIVE_INFINITY)).toThrow(BadRequestError);
    expect(() => Percentage.create(Number.NaN)).toThrow(BadRequestError);
  });

  it('rejects negative quantities and money', () => {
    expect(() => Quantity.create(-1)).toThrow(BadRequestError);
    expect(() => Money.create(-0.01)).toThrow(BadRequestError);
  });

  it('refuses to decrease by a negative amount or below zero', () => {
    expect(() => Quantity.create(5).decrease(-1)).toThrow(BadRequestError);
    expect(() => Quantity.create(5).decrease(6)).toThrow(BadRequestError);
    expect(Quantity.create(5).decrease(5).value).toBe(0);
  });

  it('reports the percentage complement', () => {
    expect(Percentage.create(30).remainder.value).toBe(70);
  });
});

describe('date value objects', () => {
  it('rejects invalid dates', () => {
    expect(() => EffectiveDate.create(new Date('not-a-date'))).toThrow(BadRequestError);
    expect(() => ExpirationDate.rehydrate(new Date(Number.NaN))).toThrow(BadRequestError);
  });

  it('does not expose its internal Date for mutation', () => {
    const effective = EffectiveDate.fromDaysAgo(1);
    const before = effective.value.getTime();

    effective.value.setFullYear(1999);

    expect(effective.value.getTime()).toBe(before);
  });
});

describe('Id', () => {
  it('generates a valid id when none is supplied', () => {
    expect(Id.isValid(Id.create().value)).toBe(true);
  });

  it('rejects whitespace, quotes and other unsafe characters', () => {
    expect(() => Id.create('abcdef ghij')).toThrow(BadRequestError);
    expect(() => Id.create("abc'defgh")).toThrow(BadRequestError);
    expect(() => Id.create('abcd$efgh')).toThrow(BadRequestError);
    expect(() => Id.create('../../../etc')).toThrow(BadRequestError);
  });

  it('keeps normal object ids and uuids valid', () => {
    expect(Id.isValid('507f1f77bcf86cd799439011')).toBe(true);
    expect(Id.isValid('00000000-0000-7000-8000-000000000100')).toBe(true);
  });
});

describe('ColorVO', () => {
  it('accepts 3, 6 and 8 digit hex colors', () => {
    expect(ColorVO.create('#FFF').value).toBe('#FFF');
    expect(ColorVO.create('#123abc').value).toBe('#123abc');
    expect(ColorVO.create('#12345678').value).toBe('#12345678');
  });

  it('rejects malformed colors', () => {
    expect(() => ColorVO.create('red')).toThrow(BadRequestError);
    expect(() => ColorVO.create('#12345')).toThrow(BadRequestError);
  });
});

describe('EmailVO', () => {
  it('trims the address and compares case-insensitively', () => {
    const email = EmailVO.create('  Buyer@Example.COM  ');

    expect(email.value).toBe('Buyer@Example.COM');
    expect(email.normalized).toBe('buyer@example.com');
    expect(email.equals(EmailVO.create('buyer@example.com'))).toBe(true);
  });

  it('rejects malformed and over-long addresses', () => {
    expect(() => EmailVO.create('not-an-email')).toThrow(BadRequestError);
    expect(() => EmailVO.create(`${'a'.repeat(250)}@example.com`)).toThrow(BadRequestError);
  });
});

describe('UrlVO', () => {
  it('accepts http(s) urls and exposes host information', () => {
    const url = UrlVO.create('https://cdn.example.com/images/a.png');

    expect(url.hostname).toBe('cdn.example.com');
    expect(url.isHttps).toBe(true);
  });

  it('rejects non-http protocols, credentials and over-long urls', () => {
    expect(() => UrlVO.create('javascript:alert(1)')).toThrow(BadRequestError);
    expect(() => UrlVO.create('https://trusted.example@evil.example/a.png')).toThrow(
      BadRequestError,
    );
    expect(() => UrlVO.create(`https://example.com/${'a'.repeat(2048)}`)).toThrow(BadRequestError);
  });
});

describe('trimmed string value objects', () => {
  it('measures title length after trimming', () => {
    expect(() => Title.create('   ab   ')).toThrow(BadRequestError);
    expect(Title.create('  abc  ').value).toBe('abc');
  });

  it('cannot bypass address length limits with padding', () => {
    expect(() => StreetAddressVO.create('         ')).toThrow(BadRequestError);
    expect(() => StreetAddressVO.create('  abc  ')).toThrow(BadRequestError);
    expect(StreetAddressVO.create('  12 Main St  ').value).toBe('12 Main St');
  });
});

describe('ban and block value objects', () => {
  it('refuses inconsistent ban windows at creation time', () => {
    const from = EffectiveDate.today();
    const until = ExpirationDate.fromDays(1);

    expect(() => BanInfoVO.create(id(1), from, null, reason())).toThrow(BadRequestError);
    expect(() => BanInfoVO.create(id(1), until as never, from as never, reason())).toThrow(
      BadRequestError,
    );
  });

  it('returns an empty ban for all-null input', () => {
    const ban = BanInfoVO.create(null, null, null, null);

    expect(ban.isBan).toBe(false);
  });

  it('rejects non-positive extend and shorten days', () => {
    const ban = BanInfoVO.create(
      id(1),
      EffectiveDate.today(),
      ExpirationDate.fromDays(2),
      reason(),
    );

    expect(() => ban.extend(0)).toThrow(BadRequestError);
    expect(() => ban.extend(-1)).toThrow(BadRequestError);
    expect(() => ban.shorten(0)).toThrow(BadRequestError);
    expect(() => ban.shorten(-1)).toThrow(BadRequestError);
  });

  it('requires an actor and a reason to block', () => {
    expect(() => BlockInfoVO.create(null, reason())).toThrow(BadRequestError);
    expect(() => BlockInfoVO.create(id(1), null)).toThrow(BadRequestError);
    expect(BlockInfoVO.create(id(1), reason()).isBlocked).toBe(true);
  });
});

describe('ImageVO', () => {
  const image = (defaultImage: boolean) =>
    ImageVO.create(
      UrlVO.create('https://cdn.example.com/a.png'),
      AltVO.create('Product photo'),
      defaultImage,
    );

  it('returns a new image instead of mutating the default flag', () => {
    const original = image(false);
    const updated = original.setDefault(true);

    expect(original.isDefault).toBe(false);
    expect(updated.isDefault).toBe(true);
    expect(updated.equals(original)).toBe(false);
  });

  it('keeps exactly one default image in a collection', () => {
    const first = image(true);
    const second = image(false);
    const images = ImagesVO.create([first, second]);
    const updated = images.setDefault(Quantity.create(1));

    expect(images.getDefault()?.url.value).toBe(first.url.value);
    expect(updated.getDefault()?.url.value).toBe(second.url.value);
    expect(updated.value.filter((item) => item.isDefault)).toHaveLength(1);
  });

  it('rejects an out-of-range default index', () => {
    const images = ImagesVO.create([image(false)]);

    expect(() => images.setDefault(Quantity.create(1))).toThrow(BadRequestError);
  });
});
