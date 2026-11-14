import type { ImageKey } from '../../../value-objects/image-key.vo';
import type { ImageMetadata } from '../value-objects/image-metadata.vo';

/**
 * Read model returned after an upload, replace, or transform.
 *
 * `publicUrl` intentionally stays a plain string: a local-storage adapter may
 * legitimately return a relative path (e.g. `/media/images/a.jpg`) that would
 * fail an absolute-URL value object. Wrap it into domain `UrlVO`/`ImageVO` at
 * the application layer, where absolute vs relative semantics are decided.
 */
export interface StoredImage {
  key: ImageKey;
  /** Public (or signed for private buckets) URL or provider path. */
  publicUrl: string;
  /** Provider version marker, useful for cache-busting. */
  version?: string;
  /** Optional instance metadata for the stored object. */
  metadata?: ImageMetadata;
}
