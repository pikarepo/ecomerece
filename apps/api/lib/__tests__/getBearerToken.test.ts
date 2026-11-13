import { describe, expect, it } from 'bun:test';
import { getBearerToken } from '../getBearerToken';

describe('getBearerToken', () => {
  it('returns null for a missing header', () => {
    expect(getBearerToken()).toBeNull();
    expect(getBearerToken('')).toBeNull();
  });

  it('extracts a well-formed token', () => {
    expect(getBearerToken('Bearer abc')).toBe('abc');
    expect(getBearerToken('bearer abc')).toBe('abc');
  });

  it('accepts a token without the Bearer prefix', () => {
    expect(getBearerToken('abc')).toBe('abc');
  });

  it('collapses duplicated Bearer segments and extra whitespace', () => {
    expect(getBearerToken('Bearer Bearer abc')).toBe('abc');
    expect(getBearerToken('Bearer  Bearer   Bearer abc')).toBe('abc');
  });

  it('returns null when no token is present', () => {
    expect(getBearerToken('Bearer')).toBeNull();
    expect(getBearerToken('Bearer   ')).toBeNull();
  });
});
