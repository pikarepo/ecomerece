import mongoose from 'mongoose';
import { BadRequestError, ConflictError } from './app-error';

export function handleMongooseError(err: any): Error {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new BadRequestError(messages.join(', '));
  }

  if (err instanceof mongoose.Error.CastError) {
    return new BadRequestError('The provided identifier is not in a valid format.');
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return new ConflictError(
      field
        ? `The ${field} you provided already exists.`
        : 'A record with the same value already exists.',
    );
  }

  return err;
}
