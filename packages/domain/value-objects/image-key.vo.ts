import { ImageInvalidKeyError } from '../errors/image-invalid-key.error';

/**
 * Provider-neutral object key (folder path + file name).
 *
 * Every provider (S3 key, Cloudinary public_id, R2 object key, ImageKit
 * fileId, local FS path) can be expressed as a path-like string, so this VO
 * hides folder/file-name handling behind a single value.
 */
export class ImageKey {
  private constructor(private readonly _value: string) {}

  /**
   * Builds a key from a folder (single segment or path) and a file name.
   * Leading/trailing slashes and empty segments are normalized away.
   */
  static create(folder: string | readonly string[], fileName: string): ImageKey {
    const folders = Array.isArray(folder) ? folder : (folder as string).split('/');
    const raw = [...folders, fileName].filter((part) => part && part.trim().length > 0).join('/');
    const normalized = raw
      .split('/')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0 && segment !== '.')
      .join('/');

    return new ImageKey(ImageKey.validate(normalized));
  }

  static rehydrate(key: string): ImageKey {
    return new ImageKey(ImageKey.validate(key));
  }

  private static validate(value: string): string {
    if (!value || value.length === 0) {
      throw new ImageInvalidKeyError('Image key cannot be empty.');
    }
    if (value.length > 1024) {
      throw new ImageInvalidKeyError('Image key exceeds the maximum length of 1024 characters.');
    }
    if (value.startsWith('/') || value.endsWith('/')) {
      throw new ImageInvalidKeyError('Image key cannot start or end with "/".');
    }
    if (value.split('/').some((segment) => segment === '..')) {
      throw new ImageInvalidKeyError('Image key cannot contain ".." path segments.');
    }
    if ([...value].some((char) => char.charCodeAt(0) < 32)) {
      throw new ImageInvalidKeyError('Image key cannot contain control characters.');
    }

    return value;
  }

  get value(): string {
    return this._value;
  }

  get folder(): string {
    const index = this._value.lastIndexOf('/');
    return index === -1 ? '' : this._value.slice(0, index);
  }

  get fileName(): string {
    const index = this._value.lastIndexOf('/');
    return index === -1 ? this._value : this._value.slice(index + 1);
  }

  get extension(): string | null {
    const name = this.fileName;
    const index = name.lastIndexOf('.');
    if (index <= 0) return null;
    return name.slice(index + 1).toLowerCase();
  }

  /**
   * Reflects the key inside a different folder, e.g. moving a blob
   * `images/a.jpg` into `archive` produces `archive/images/a.jpg`.
   */
  inFolder(folder: string | readonly string[]): ImageKey {
    return ImageKey.create(folder, this._value);
  }

  /** Appends a suffix before the extension, e.g. `a_thumb.jpg`. */
  withSuffix(suffix: string): ImageKey {
    const cleaned = suffix.trim();
    if (!cleaned) return this;

    if (!this.extension) {
      return ImageKey.rehydrate(`${this._value}${cleaned}`);
    }
    const stem = this._value.slice(0, this._value.length - this.extension.length - 1);
    return ImageKey.rehydrate(`${stem}${cleaned}.${this.extension}`);
  }

  equals(other: ImageKey | string): boolean {
    const candidate = typeof other === 'string' ? other : other.value;
    return this._value === candidate;
  }

  toString(): string {
    return this._value;
  }
}
