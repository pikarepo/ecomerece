import { AppError } from './app-error';

/**
 * Provider-neutral image key failure.
 *
 * Lives in the shared kernel (not the image-storage module) because `ImageKey`
 * is used by other domain modules and they must not import module internals.
 */
export class ImageInvalidKeyError extends AppError {
  constructor(message = 'The image key is invalid.') {
    super(message, 'IMAGE_STORAGE_INVALID_KEY', 400);
  }
}
