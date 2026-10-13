//backend
import type { Context } from 'hono';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from './app-error';

function sanitizeStatus(code: unknown): number {
  const num = Number(code);
  if (num === 101 || (num >= 200 && num <= 599)) return num;
  return 500;
}

export function registerErrorHandler(app: any) {
  app.onError((err: unknown, c: Context) => {
    const isDev = process.env.NODE_ENV !== 'production';

    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An internal server error occurred. Please try again later.';
    let stack: string | undefined;
    let issues: any;

    // Zod Validation Errors
    if (err instanceof ZodError) {
      status = 400;
      code = 'VALIDATION_ERROR';
      message = 'The request is invalid. Please review the highlighted fields.';

      issues = err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
    }

    // Custom App Errors
    else if (err instanceof AppError) {
      status = sanitizeStatus(err.status);
      code = err.code;
      message = err.message;
      issues = err.issues;
    }

    // Mongo Duplicate Key Error
    else if ((err as any)?.code === 11000) {
      status = 409;
      code = 'CONFLICT';

      const field = Object.keys((err as any).keyPattern || {})[0];

      message = field
        ? `The ${field} you provided already exists.`
        : 'A record with the same value already exists.';
    }

    // Mongoose Validation Error
    else if (err instanceof mongoose.Error.ValidationError) {
      status = 400;
      code = 'VALIDATION_ERROR';
      message = 'The provided data is invalid. Please review the highlighted fields.';

      issues = Object.values(err.errors).map((e: any) => ({
        field: e.path,
        message: e.message,
      }));
    }

    // Mongoose Invalid ObjectId
    else if (err instanceof mongoose.Error.CastError) {
      status = 400;
      code = 'INVALID_ID';
      message = 'The provided identifier is not in a valid format.';
    }

    // Generic Errors
    else if (err instanceof Error) {
      if (isDev) {
        message = err.message;
        stack = err.stack;
      } else {
        message = 'An unexpected error occurred. Please try again later.';
      }
    }

    return c.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(issues ? { issues } : {}),
          ...(isDev && stack ? { stack } : {}),
        },
      },
      status as any,
    );
  });

  app.notFound((c: Context) => {
    return c.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'The requested route was not found.',
        },
      },
      404 as any,
    );
  });
}
