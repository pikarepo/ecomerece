import { describe, expect, it } from 'bun:test';
import { getMyOrdersQuerySchema } from '../../request-dtos/order/order-query.dto';
import { getPaginatedStatsQuerySchema } from '../../request-dtos/stats/stats-query.dto';
import {
  altSchema,
  colorSchema,
  descriptionSchema,
  emailSchema,
  idSchema,
  nameSchema,
  optionalEmailSchema,
  phoneNumberSchema,
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
