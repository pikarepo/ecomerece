import type { AltVO } from './alt.vo';
import type { UrlVO } from './url.vo';

export class ImageVO {
  private constructor(
    readonly url: UrlVO,
    readonly alt: AltVO,
    readonly isDefault: boolean,
    readonly imageKey?: string,
  ) {}

  static create(url: UrlVO, alt: AltVO, isDefault: boolean, imageKey?: string): ImageVO {
    return new ImageVO(url, alt, isDefault ?? false, imageKey);
  }

  static rehydrate(url: UrlVO, alt: AltVO, isDefault: boolean, imageKey?: string): ImageVO {
    return new ImageVO(url, alt, isDefault ?? false, imageKey);
  }

  setDefault(val: boolean): ImageVO {
    return new ImageVO(this.url, this.alt, val, this.imageKey);
  }

  equals(other: ImageVO): boolean {
    return (
      this.url.equals(other.url) &&
      this.alt.equals(other.alt) &&
      this.isDefault === other.isDefault &&
      this.imageKey === other.imageKey
    );
  }

  toObject() {
    return {
      url: this.url.value,
      alt: this.alt.value,
      default: this.isDefault,
      ...(this.imageKey ? { imageKey: this.imageKey } : {}),
    };
  }
}
