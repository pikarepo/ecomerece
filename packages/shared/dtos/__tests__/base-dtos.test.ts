import { describe, expect, it } from 'bun:test';
import { getMyOrdersQuerySchema } from '../../request-dtos/order/order-query.dto';
import { getPaginatedStatsQuerySchema } from '../../request-dtos/stats/stats-query.dto';
import {
  altSchema,
  clerkUserIdSchema,
  colorSchema,
  dateSchema,
  descriptionSchema,
  emailSchema,
  iconSchema,
  idSchema,
  imageDataUriSchema,
  imageSchema,
  moneySchema,
  nameSchema,
  optionalEmailSchema,
  phoneNumberSchema,
  positiveNumberSchema,
  ratingSchema,
  reasonSchema,
  titleSchema,
  urlSchema,
} from '../index';

describe('text base schemas', () => {
  it('trims before measuring length', () => {
    expect(titleSchema.parse('  Product title  ')).toBe('Product title');
    expect(titleSchema.safeParse('   ab   ').success).toBe(false);
    expect(altSchema.parse('  A product photo  ')).toBe('A product photo');
    expect(altSchema.safeParse('   ab   ').success).toBe(false);
    expect(descriptionSchema.parse('  A valid description.  ')).toBe('A valid description.');
    expect(descriptionSchema.safeParse('   too short   ').success).toBe(false);
    expect(reasonSchema.parse('  spamming the marketplace  ')).toBe('spamming the marketplace');
    expect(reasonSchema.safeParse('   short   ').success).toBe(false);
    expect(nameSchema.parse('  Jane  ')).toBe('Jane');
    expect(nameSchema.safeParse('   ').success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('trims and accepts valid addresses', () => {
    expect(emailSchema.parse('  Buyer@Example.com  ')).toBe('Buyer@Example.com');
    expect(optionalEmailSchema.parse(undefined)).toBeUndefined();
  });

  it('rejects malformed and over-long addresses', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    expect(emailSchema.safeParse(`${'a'.repeat(250)}@example.com`).success).toBe(false);
  });
});

describe('urlSchema', () => {
  it('trims and accepts http(s) urls', () => {
    expect(urlSchema.parse('  https://cdn.example.com/a.png  ')).toBe(
      'https://cdn.example.com/a.png',
    );
    expect(urlSchema.safeParse('http://example.com').success).toBe(true);
  });

  it('rejects non-http protocols, credentials and over-long urls', () => {
    expect(urlSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(urlSchema.safeParse('ftp://example.com/a.png').success).toBe(false);
    expect(urlSchema.safeParse('https://trusted.example@evil.example/a.png').success).toBe(false);
    expect(urlSchema.safeParse(`https://example.com/${'a'.repeat(2048)}`).success).toBe(false);
  });
});

describe('idSchema', () => {
  it('accepts uuids and rejects other formats', () => {
    expect(idSchema.safeParse('00000000-0000-7000-8000-000000000100').success).toBe(true);
    expect(idSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(false);
    expect(idSchema.safeParse('not an id').success).toBe(false);
  });
});

describe('phoneNumberSchema', () => {
  it('trims and validates the digit pattern', () => {
    expect(phoneNumberSchema.parse('  +123456789  ')).toBe('+123456789');
    expect(phoneNumberSchema.safeParse('+12 345 6789').success).toBe(false);
  });
});

describe('request dto messages', () => {
  it('returns explicit messages for invalid query values', () => {
    const direction = getMyOrdersQuerySchema.safeParse({ direction: 'sideways' });
    expect(direction.success).toBe(false);
    if (!direction.success) {
      expect(direction.error.issues[0]?.message).toBe('Direction must be either next or prev');
    }

    const limit = getPaginatedStatsQuerySchema.safeParse({ entityType: 'product', limit: 0 });
    expect(limit.success).toBe(false);
    if (!limit.success) {
      expect(limit.error.issues[0]?.message).toBe('Limit must be at least 1');
    }

    const type = getPaginatedStatsQuerySchema.safeParse({ entityType: 'planet' });
    expect(type.success).toBe(false);
    if (!type.success) {
      expect(type.error.issues[0]?.message).toContain('Entity type must be one of');
    }
  });
});

describe('colorSchema', () => {
  it('accepts 3, 6 and 8 digit hex colors', () => {
    expect(colorSchema.safeParse('#FFF').success).toBe(true);
    expect(colorSchema.safeParse('#123abc').success).toBe(true);
    expect(colorSchema.safeParse('#12345678').success).toBe(true);
    expect(colorSchema.safeParse('red').success).toBe(false);
  });
});

const nilUuid = '00000000-0000-0000-0000-000000000000';
const v4Uuid = '00000000-0000-4000-8000-000000000007';
const https = 'https://cdn.example.com/image.png';

type ParseResult = { success: boolean; data?: unknown };

type SchemaLike = { safeParse(input: unknown): unknown };

function parse(schema: SchemaLike, input: unknown): ParseResult {
  return schema.safeParse(input) as ParseResult;
}

function evidence(tag: string, data: Record<string, unknown>) {
  const prefix = tag.startsWith('SHARED-') ? '' : 'SHARED-';
  console.log(`[${prefix}${tag}] ${JSON.stringify(data)}`);
}

describe('base DTO exploitation', () => {
  it.failing('SHARED-BASE-TEXT-CONTROL accepts markup, NUL and bidi overrides in displayed text', () => {
    const schemas = [
      ['title', titleSchema],
      ['alt', altSchema],
      ['description', descriptionSchema],
      ['reason', reasonSchema],
      ['name', nameSchema],
    ] as const;
    const vectors = [
      { label: 'markup', value: '<script>alert(1)</script>' },
      { label: 'nul', value: 'ok\u0000bad' },
      { label: 'bidi', value: 'left\u202Eright' },
      { label: 'breakout', value: '"><img src=x onerror=alert(1)>' },
    ];
    const accepted = schemas.flatMap(([name, schema]) =>
      vectors
        .filter(({ value }) => parse(schema, value).success)
        .map(({ label }) => `${name}:${label}`),
    );

    evidence('SHARED-BASE-TEXT-CONTROL', { accepted });
    expect(accepted).toEqual([]);
  });

  it('SHARED-BASE-EMAIL-INJECTION still rejects CRLF and display-name vectors', () => {
    const vectors = [
      'a@example.com\nBcc: victim@example.com',
      'Buyer <buyer@example.com>',
      'a..b@example.com',
      '.a@example.com',
      'a@localhost',
    ];
    const accepted = vectors.filter((value) => parse(emailSchema, value).success);

    evidence('SHARED-BASE-EMAIL-INJECTION', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-URL-INTERNAL accepts loopback, link-local, IPv6 and encoded CRLF hosts', () => {
    const vectors = [
      'http://127.0.0.1',
      'http://169.254.169.254/latest/meta-data/',
      'http://[::1]',
      'https://example.com/%0d%0aX',
    ];
    const accepted = vectors.filter((value) => parse(urlSchema, value).success);

    evidence('SHARED-BASE-URL-INTERNAL', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-ID-VERSION accepts nil and v4 identifiers', () => {
    const accepted = [nilUuid, v4Uuid].filter((value) => parse(idSchema, value).success);

    evidence('SHARED-BASE-ID-VERSION', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-CLERK-NIL accepts the nil uuid as a clerk user', () => {
    const result = parse(clerkUserIdSchema, nilUuid);
    expect(result.success).toBe(true);

    evidence('SHARED-BASE-CLERK-NIL', { success: result.success });
    expect(result.success).toBe(false);
  });

  it.failing('SHARED-BASE-POS-NUMBER accepts fractional and unsafe quantities', () => {
    const vectors = [1.5, Number.MAX_SAFE_INTEGER + 1, 1e308];
    const accepted = vectors.filter((value) => parse(positiveNumberSchema, value).success);

    evidence('SHARED-BASE-POS-NUMBER', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-MONEY accepts sub-cent precision and unsafe magnitudes', () => {
    const vectors = [1.0000000000000002, Number.MAX_SAFE_INTEGER + 1, 1e308];
    const accepted = vectors.filter((value) => parse(moneySchema, value).success);

    evidence('SHARED-BASE-MONEY', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-DATAURI accepts non-decodable and oversized base64', () => {
    const vectors = [
      { label: 'single-char', value: 'data:image/png;base64,a' },
      { label: 'bad-padding', value: 'data:image/png;base64,AAAA====' },
      { label: '5mb', value: `data:image/png;base64,${'A'.repeat(5_000_000)}` },
    ];
    const accepted = vectors
      .filter(({ value }) => parse(imageDataUriSchema, value).success)
      .map(({ label, value }) => ({ label, length: value.length }));

    evidence('SHARED-BASE-DATAURI', { accepted });
    expect(accepted).toEqual([]);
  });

  it.failing('SHARED-BASE-IMAGE-STRICT strips privileged keys instead of rejecting the image', () => {
    const result = parse(imageSchema, {
      url: https,
      alt: 'A product photo',
      isDefault: true,
      internalId: 'secret',
      isAdmin: true,
    });

    expect(result.success).toBe(true);
    evidence('SHARED-BASE-IMAGE-STRICT', {
      success: result.success,
      keys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : [],
    });
    expect(result.success).toBe(false);
  });

  it('SHARED-BASE-ICON-RATING-COLOR still reject hostile values', () => {
    expect(parse(iconSchema, '_Icon').success).toBe(false);
    expect(parse(iconSchema, 'Icon<script>').success).toBe(false);
    expect(parse(ratingSchema, '5').success).toBe(false);
    expect(parse(ratingSchema, 5.0000001).success).toBe(false);
    expect(parse(colorSchema, '#fff\u0000').success).toBe(false);
  });

  it('SHARED-BASE-DATE still rejects invalid and non-Date values', () => {
    expect(parse(dateSchema, new Date('nope')).success).toBe(false);
    expect(parse(dateSchema, '2026-01-01').success).toBe(false);
  });
});
