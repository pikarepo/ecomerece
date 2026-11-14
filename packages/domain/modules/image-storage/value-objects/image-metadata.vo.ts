import type { ImageKey } from '../../../value-objects/image-key.vo';

export interface ImageMetadataProps {
  key: ImageKey;
  /** Size in bytes, if the provider reports it. */
  sizeBytes: number;
  /** MIME content type, e.g. `image/webp`. */
  contentType: string;
  /** Pixel width of the stored asset. */
  width?: number;
  /** Pixel height of the stored asset. */
  height?: number;
  /** Canonical format, e.g. `jpeg`, `png`, `webp`. */
  format?: string;
  /** Provider ETag / version hash, usable for cache validation. */
  etag?: string;
  /** Content checksum (md5/sha256) when the provider exposes one. */
  checksum?: string;
  /** Cache directive returned/stored for the object. */
  cacheControl?: string;
  access?: 'public' | 'private';
  createdAt?: Date;
  lastModified?: Date;
}

/**
 * Provider-neutral metadata describing a stored image: content type, size,
 * dimensions, and cache/ETag information.
 */
export class ImageMetadata {
  private constructor(private readonly _props: ImageMetadataProps) {}

  static create(props: ImageMetadataProps): ImageMetadata {
    return new ImageMetadata(props);
  }

  static rehydrate(props: ImageMetadataProps): ImageMetadata {
    return new ImageMetadata(props);
  }

  get key(): ImageKey {
    return this._props.key;
  }

  get sizeBytes(): number {
    return this._props.sizeBytes;
  }

  get contentType(): string {
    return this._props.contentType;
  }

  get width(): number | undefined {
    return this._props.width;
  }

  get height(): number | undefined {
    return this._props.height;
  }

  get format(): string | undefined {
    return this._props.format;
  }

  get etag(): string | undefined {
    return this._props.etag;
  }

  get checksum(): string | undefined {
    return this._props.checksum;
  }

  get cacheControl(): string | undefined {
    return this._props.cacheControl;
  }

  get access(): 'public' | 'private' | undefined {
    return this._props.access;
  }

  get createdAt(): Date | undefined {
    return this._props.createdAt;
  }

  get lastModified(): Date | undefined {
    return this._props.lastModified;
  }

  equals(other: ImageMetadata): boolean {
    return (
      this.key.equals(other.key) &&
      this.sizeBytes === other.sizeBytes &&
      this.contentType === other.contentType &&
      this.etag === other.etag &&
      this.width === other.width &&
      this.height === other.height
    );
  }

  toObject() {
    return {
      key: this.key.value,
      sizeBytes: this.sizeBytes,
      contentType: this.contentType,
      width: this.width,
      height: this.height,
      format: this.format,
      etag: this.etag,
      checksum: this.checksum,
      cacheControl: this.cacheControl,
      access: this.access,
      createdAt: this.createdAt,
      lastModified: this.lastModified,
    };
  }
}
