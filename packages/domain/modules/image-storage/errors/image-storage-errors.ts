import { AppError } from '../../../errors/app-error';

/**
 * Base class for every image-storage failure.
 *
 * These are the ONLY error types an adapter may throw. Implementations must
 * translate their provider's native errors (Cloudinary, S3, R2, ImageKit,
 * local FS, ...) into this hierarchy so application/domain code can catch a
 * provider-independent error without ever touching a provider SDK.
 */
export class ImageStorageError extends AppError {
  constructor(message: string, code: string = 'IMAGE_STORAGE_ERROR', status: number = 502) {
    super(message, code, status);
  }
}

export { ImageInvalidKeyError } from '../../../errors/image-invalid-key.error';

export class ImageNotFoundError extends ImageStorageError {
  constructor(message = 'The requested image was not found in storage.') {
    super(message, 'IMAGE_STORAGE_NOT_FOUND', 404);
  }
}

export class ImageAlreadyExistsError extends ImageStorageError {
  constructor(message = 'An image with the same key already exists.') {
    super(message, 'IMAGE_STORAGE_ALREADY_EXISTS', 409);
  }
}

export class ImageConflictError extends ImageStorageError {
  constructor(message = 'The image operation conflicted with the current state of the object.') {
    super(message, 'IMAGE_STORAGE_CONFLICT', 409);
  }
}

export class ImageAccessDeniedError extends ImageStorageError {
  constructor(message = 'Access to the image storage was denied.') {
    super(message, 'IMAGE_STORAGE_ACCESS_DENIED', 403);
  }
}

export class ImageRateLimitedError extends ImageStorageError {
  constructor(message = 'The image storage provider rate-limited the request.') {
    super(message, 'IMAGE_STORAGE_RATE_LIMITED', 429);
  }
}

export class ImageQuotaExceededError extends ImageStorageError {
  constructor(message = 'The image storage quota was exceeded.') {
    super(message, 'IMAGE_STORAGE_QUOTA_EXCEEDED', 507);
  }
}

export class ImageUploadFailedError extends ImageStorageError {
  constructor(message = 'The image could not be uploaded to storage.') {
    super(message, 'IMAGE_STORAGE_UPLOAD_FAILED', 502);
  }
}

export class ImageDeleteFailedError extends ImageStorageError {
  constructor(message = 'The image could not be deleted from storage.') {
    super(message, 'IMAGE_STORAGE_DELETE_FAILED', 502);
  }
}

export class ImageTransformationFailedError extends ImageStorageError {
  constructor(message = 'The image transformation could not be applied.') {
    super(message, 'IMAGE_STORAGE_TRANSFORM_FAILED', 502);
  }
}

export class ImageStreamError extends ImageStorageError {
  constructor(message = 'The image stream could not be produced.') {
    super(message, 'IMAGE_STORAGE_STREAM_ERROR', 502);
  }
}

export class ImageProviderUnavailableError extends ImageStorageError {
  constructor(message = 'The image storage provider is temporarily unavailable.') {
    super(message, 'IMAGE_STORAGE_UNAVAILABLE', 503);
  }
}

export class ImageAbortedError extends ImageStorageError {
  constructor(message = 'The image operation was aborted.') {
    super(message, 'IMAGE_STORAGE_ABORTED', 499);
  }
}
