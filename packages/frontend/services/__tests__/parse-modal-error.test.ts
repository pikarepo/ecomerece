import { describe, expect, it } from 'bun:test';
import { parseModalError } from '../parseModalError.service';

describe('parseModalError', () => {
  it('returns an empty list for a missing error', () => {
    expect(parseModalError(undefined)).toEqual([]);
    expect(parseModalError(null)).toEqual([]);
  });

  it('turns a plain string into a message entry', () => {
    expect(parseModalError('Something went wrong')).toEqual([{ message: 'Something went wrong' }]);
  });

  it('parses a JSON array string and joins issue paths', () => {
    expect(
      parseModalError(JSON.stringify([{ path: ['address', 'city'], message: 'City is required' }])),
    ).toEqual([{ field: 'address.city', message: 'City is required' }]);
  });

  it('parses a JSON object string with a message', () => {
    expect(parseModalError(JSON.stringify({ message: 'Invalid input' }))).toEqual([
      { message: 'Invalid input' },
    ]);
  });

  it('falls back to the raw string when JSON is malformed', () => {
    expect(parseModalError('{not json}')).toEqual([{ message: '{not json}' }]);
  });

  it('reads a ZodError style issues array', () => {
    const result = parseModalError({
      issues: [
        { path: ['title'], message: 'Title must be at least 3 characters' },
        { path: ['price'], message: 'Price must be at least 1' },
        'plain issue',
        { path: ['skipped'] },
      ],
    });

    expect(result).toEqual([
      { field: 'title', message: 'Title must be at least 3 characters' },
      { field: 'price', message: 'Price must be at least 1' },
      { message: 'plain issue' },
    ]);
  });

  it('reads a server errors array with field and property aliases', () => {
    expect(
      parseModalError({
        errors: [
          { field: 'email', message: 'Email already exists' },
          { property: 'slug', message: 'Slug already exists' },
          { error: 'Generic failure' },
        ],
      }),
    ).toEqual([
      { field: 'email', message: 'Email already exists' },
      { field: 'slug', message: 'Slug already exists' },
      { message: 'Generic failure' },
    ]);
  });

  it('unwraps an axios style response payload', () => {
    expect(parseModalError({ response: { data: { message: 'Server said no' } } })).toEqual([
      { message: 'Server said no' },
    ]);
  });

  it('parses a nested JSON message string', () => {
    expect(
      parseModalError({ message: JSON.stringify([{ path: ['qty'], message: 'Too low' }]) }),
    ).toEqual([{ field: 'qty', message: 'Too low' }]);
  });

  it('falls back to the error property and then a generic message', () => {
    expect(parseModalError({ error: 'Bad request' })).toEqual([{ message: 'Bad request' }]);
    expect(parseModalError(42)).toEqual([
      { message: 'An unexpected error occurred. Please try again.' },
    ]);
  });
});
