import type { PostgrestError } from '@supabase/supabase-js';
import { AppError, BadRequestError, ConflictError, NotFoundError } from './app-error';

export function handleSupabaseError(
  error: PostgrestError | null,
  defaultMessage = 'Database operation failed',
): AppError {
  if (!error) {
    return new AppError(defaultMessage, 'UNKNOWN_ERROR', 500);
  }

  const { code, message, details } = error;

  switch (code) {
    case '23505': {
      const field = extractFieldFromDetail(details);

      return new ConflictError(
        field
          ? `The ${field} you provided already exists.`
          : 'A record with the same value already exists.',
      );
    }

    case '23503':
      return new BadRequestError('A related resource does not exist.');

    case '23502':
      return new BadRequestError('A required field is missing.');

    case '22P02':
      return new BadRequestError('The provided input is not in a valid format.');

    case 'PGRST116':
      return new NotFoundError('The requested resource was not found.');

    default:
      return new AppError(message || defaultMessage, code || 'DATABASE_ERROR', 500);
  }
}

function extractFieldFromDetail(details?: string): string | null {
  if (!details) return null;

  const match = details.match(/Key \((\w+)\)=/);

  return match ? match[1] : null;
}
