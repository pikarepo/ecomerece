import type { ReadableStream } from 'node:stream/web';
import type { ImageKey } from '../../../value-objects/image-key.vo';
import type { BatchResult } from '../read-models/batch-result.read-model';
import type { StoredImage } from '../read-models/stored-image.read-model';
import type { ImageMetadata } from '../value-objects/image-metadata.vo';
import type { ImageSource } from '../value-objects/image-source.vo';
import type { ImageTransform } from '../value-objects/image-transform.vo';

export type ImageAccess = 'public' | 'private';

export interface StorageCallOptions {
  /** Attach an `AbortSignal` to cancel the underlying provider request. */
  signal?: AbortSignal;
  /** Preferred edge/region hint; ignored by providers without regions. */
  region?: string;
}

export interface BatchStorageCallOptions extends StorageCallOptions {
  /** Max number of provider requests to run concurrently. */
  concurrency?: number;
  /** Continue on individual failures instead of throwing on the first one. */
  continueOnError?: boolean;
}

export interface UploadOptions extends StorageCallOptions {
  /** Folder/path prefix to store under (combined with `fileName` into a key). */
  folder?: string | readonly string[];
  /** Explicit file name; ignored when `key` is provided. */
  fileName?: string;
  /**
   * Explicit key. Retry-safe: calling upload again with the same key either
   * no-ops or overwrites (per `overwrite`), which is what makes client-side
   * retry loops idempotent.
   */
  key?: ImageKey;
  /** Public assets are served from a CDN; private ones need signed URLs. */
  access?: ImageAccess;
  /** Overwrite an existing object at the same key instead of failing. */
  overwrite?: boolean;
  /** Cache directive stamped on the object. */
  cacheControl?: string;
  /** Provider-specific key/value metadata attached to the object. */
  customMetadata?: Record<string, string>;
  /** Provider categorization tags, when supported. */
  tags?: string[];
}

export interface ReplaceOptions extends UploadOptions {
  /** Create the object when the key does not exist yet (default: throw not-found). */
  createIfMissing?: boolean;
}

export interface PublicUrlOptions {
  /** Return a transformed variant of the public URL. */
  transform?: ImageTransform;
  /** Override the served file name (disposition), when supported. */
  fileName?: string;
}

export interface SignedUrlOptions extends PublicUrlOptions {
  /** How long the signed URL remains valid, in seconds. */
  expiresInSeconds?: number;
  /** HTTP method the signed URL authorizes. */
  method?: 'GET' | 'PUT';
  /** Explicit Content-Disposition header, when supported. */
  responseDisposition?: string;
}

export interface DownloadOptions extends StorageCallOptions {
  /** Optional byte-range to stream only part of the object. */
  range?: { start: number; end?: number };
}

/**
 * Provider-neutral image-storage port.
 *
 * Implement this once per provider (Cloudinary, S3, Cloudflare R2, ImageKit,
 * local filesystem, ...) and swap implementations at the composition root
 * without touching domain or application code. Adapters must:
 *
 * - translate every provider error into `ImageStorageError` subclasses,
 * - never leak provider SDK types into return values,
 * - honour `AbortSignal` when the underlying SDK supports cancellation.
 */
export interface IImageStoragePort {
  upload(source: ImageSource, options?: UploadOptions): Promise<StoredImage>;
  uploadMany(
    sources: ImageSource[],
    options?: BatchStorageCallOptions,
  ): Promise<BatchResult<StoredImage>>;

  replace(key: ImageKey, source: ImageSource, options?: ReplaceOptions): Promise<StoredImage>;

  delete(key: ImageKey, options?: StorageCallOptions): Promise<void>;
  deleteMany(keys: ImageKey[], options?: BatchStorageCallOptions): Promise<BatchResult<void>>;

  getPublicUrl(key: ImageKey, options?: PublicUrlOptions): Promise<string>;
  getSignedUrl(key: ImageKey, options?: SignedUrlOptions): Promise<string>;

  getMetadata(key: ImageKey, options?: StorageCallOptions): Promise<ImageMetadata>;
  getMetadataMany(
    keys: ImageKey[],
    options?: BatchStorageCallOptions,
  ): Promise<BatchResult<ImageMetadata>>;

  transform(
    key: ImageKey,
    transform: ImageTransform,
    options?: StorageCallOptions,
  ): Promise<StoredImage>;

  exists(key: ImageKey, options?: StorageCallOptions): Promise<boolean>;

  download(key: ImageKey, options?: DownloadOptions): Promise<ReadableStream<Uint8Array>>;
}
