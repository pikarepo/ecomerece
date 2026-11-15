import { describe, expect, it } from 'bun:test';
import { emptyMetrics, METRIC_FIELDS } from '../types/StatTypes';
import { booleanSchema } from '../dtos/boolean-schema';
import { clerkUserIdSchema } from '../dtos/clerk-id-schema';
import { dateSchema } from '../dtos/date-schema';
import { iconSchema } from '../dtos/icon-schema';
import { imageDataUriSchema, imageInputSchema } from '../dtos/image-input-schema';
import { imageSchema } from '../dtos/image-schema';
import { moneySchema } from '../dtos/money-schema';
import { positiveNumberSchema } from '../dtos/positive-number-schema';
import { ratingSchema } from '../dtos/rating-schema';
import { optionalDescriptionSchema } from '../dtos/description-schema';

describe('numeric schemas', () => {
  it('requires money and quantities of at least one', () => {
    expect(moneySchema.safeParse(0.99).success).toBe(false);
    expect(moneySchema.safeParse(1).success).toBe(true);
    expect(positiveNumberSchema.safeParse(0).success).toBe(false);
    expect(positiveNumberSchema.safeParse(3).success).toBe(true);
    expect(moneySchema.safeParse('10').success).toBe(false);
  });

  it('accepts ratings only between 1 and 5', () => {
    expect(ratingSchema.safeParse(1).success).toBe(true);
    expect(ratingSchema.safeParse(5).success).toBe(true);
    expect(ratingSchema.safeParse(0).success).toBe(false);
    expect(ratingSchema.safeParse(6).success).toBe(false);
    expect(ratingSchema.safeParse(3.5).success).toBe(true);
  });
});

describe('booleanSchema', () => {
  it('defaults a missing flag to false and keeps explicit booleans', () => {
    expect(booleanSchema.parse(undefined)).toBe(false);
    expect(booleanSchema.parse(true)).toBe(true);
    expect(booleanSchema.safeParse('true').success).toBe(false);
  });
});

describe('clerkUserIdSchema', () => {
  it('accepts canonical uuids and trims surrounding spaces', () => {
    const uuid = '00000000-0000-4000-8000-000000000007';

    expect(clerkUserIdSchema.parse(`  ${uuid}  `)).toBe(uuid);
  });

  it('rejects short, long and malformed ids', () => {
    expect(clerkUserIdSchema.safeParse('').success).toBe(false);
    expect(clerkUserIdSchema.safeParse('user_123').success).toBe(false);
    expect(clerkUserIdSchema.safeParse(`${'a'.repeat(52)}`).success).toBe(false);
  });
});

describe('dateSchema', () => {
  it('accepts Date instances only', () => {
    expect(dateSchema.safeParse(new Date()).success).toBe(true);
    expect(dateSchema.safeParse(new Date('nope')).success).toBe(false);
    expect(dateSchema.safeParse('2026-01-01').success).toBe(false);
  });
});

describe('iconSchema', () => {
  it('accepts PascalCase icon names and trims them', () => {
    expect(iconSchema.parse('  ShoppingCart  ')).toBe('ShoppingCart');
    expect(iconSchema.safeParse('shopping cart').success).toBe(false);
    expect(iconSchema.safeParse('1Icon').success).toBe(false);
  });

  it('rejects names over 50 characters', () => {
    expect(iconSchema.safeParse(`A${'b'.repeat(50)}`).success).toBe(false);
  });
});

describe('image schemas', () => {
  it('accepts https urls and base64 image data uris', () => {
    expect(imageInputSchema.safeParse('https://cdn.example.com/a.png').success).toBe(true);
    expect(imageDataUriSchema.safeParse('data:image/png;base64,aGVsbG8=').success).toBe(true);
    expect(imageInputSchema.safeParse('data:image/png;base64,aGVsbG8=').success).toBe(true);
  });

  it('rejects non-image data uris, svg and non-http urls', () => {
    expect(imageDataUriSchema.safeParse('data:text/plain;base64,aGVsbG8=').success).toBe(false);
    expect(imageDataUriSchema.safeParse('data:image/svg+xml;base64,aGVsbG8=').success).toBe(false);
    expect(imageInputSchema.safeParse('ftp://example.com/a.png').success).toBe(false);
  });

  it('validates the stored image shape and defaults the flag to false', () => {
    expect(
      imageSchema.parse({
        url: 'https://cdn.example.com/a.png',
        alt: 'A product photo',
      }),
    ).toEqual({
      url: 'https://cdn.example.com/a.png',
      alt: 'A product photo',
      isDefault: false,
    });
    expect(imageSchema.safeParse({ url: 'not-a-url', alt: 'A product photo' }).success).toBe(false);
  });
});

describe('optional text schemas', () => {
  it('keeps an absent optional description undefined but validates a present one', () => {
    expect(optionalDescriptionSchema.parse(undefined)).toBeUndefined();
    expect(optionalDescriptionSchema.parse('A valid description.')).toBe('A valid description.');
    expect(optionalDescriptionSchema.safeParse('too short').success).toBe(false);
  });
});

describe('stats metric catalogue', () => {
  it('lists every metric exactly once', () => {
    expect(new Set(METRIC_FIELDS).size).toBe(METRIC_FIELDS.length);
    expect(METRIC_FIELDS).toContain('revenue');
    expect(METRIC_FIELDS).toContain('refundAmount');
  });

  it('starts an empty metric set at zero for every metric', () => {
    const metrics = emptyMetrics();

    expect(Object.keys(metrics).sort()).toEqual([...METRIC_FIELDS].sort());
    expect(Object.values(metrics).every((value) => value === 0)).toBe(true);
  });
});
