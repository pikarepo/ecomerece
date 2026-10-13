// parseModalError.ts

export interface ParsedFieldError {
  field?: string;
  message: string;
}

/**
 * Parses Zod issues, JSON strings, Axios backend errors, and standard JS Errors
 * into a strongly-typed array of field-level error objects.
 */
export function parseModalError(error: unknown): ParsedFieldError[] {
  if (!error) return [];

  let target: any = error;

  // 1. Handle JSON stringified error payloads
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        target = JSON.parse(trimmed);
      } catch {
        return [{ message: target }];
      }
    } else {
      return [{ message: target }];
    }
  }

  // Helper to extract field path and message
  const extractIssue = (item: any): ParsedFieldError | null => {
    if (!item) return null;
    if (typeof item === 'string') return { message: item };

    const message = item.message || item.error || null;
    if (!message) return null;

    let field: string | undefined;
    if (Array.isArray(item.path) && item.path.length > 0) {
      field = item.path.join('.');
    } else if (typeof item.field === 'string') {
      field = item.field;
    } else if (typeof item.property === 'string') {
      field = item.property;
    }

    return { field, message };
  };

  // 2. Process objects and arrays
  if (typeof target === 'object' && target !== null) {
    // Axios response wrapper
    if (target.response?.data) {
      return parseModalError(target.response.data);
    }

    // Array of Zod issues or objects
    if (Array.isArray(target)) {
      return target
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    // ZodError instance (.issues)
    if (Array.isArray(target.issues)) {
      return target.issues
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    // Server errors array (.errors)
    if (Array.isArray(target.errors)) {
      return target.errors
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    // Standard object with message string (handles nested JSON message strings)
    if (typeof target.message === 'string') {
      const msgTrimmed = target.message.trim();
      if (
        (msgTrimmed.startsWith('[') && msgTrimmed.endsWith(']')) ||
        (msgTrimmed.startsWith('{') && msgTrimmed.endsWith('}'))
      ) {
        try {
          return parseModalError(JSON.parse(msgTrimmed));
        } catch {
          // Fallthrough to standard extraction
        }
      }
      const issue = extractIssue(target);
      return issue ? [issue] : [{ message: target.message }];
    }

    if (typeof target.error === 'string') {
      return [{ message: target.error }];
    }
  }

  return [{ message: 'An unexpected error occurred. Please try again.' }];
}
