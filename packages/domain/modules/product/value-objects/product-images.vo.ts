import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import type { ImageVO, Quantity, UrlVO } from '../../../value-objects';

export class ImagesVO {
  private constructor(private readonly _images: readonly ImageVO[]) {}

  static create(images: ImageVO[]): ImagesVO {
    if (images.length === 0) {
      throw new BadRequestError('At least one product image is required.');
    }

    return new ImagesVO(images);
  }

  static rehydrate(images: ImageVO[]): ImagesVO {
    return new ImagesVO(images);
  }

  get value(): readonly ImageVO[] {
    return this._images;
  }

  get length(): number {
    return this._images.length;
  }

  get isEmpty(): boolean {
    return this._images.length === 0;
  }

  first(): ImageVO | undefined {
    return this._images[0];
  }

  setDefault(index: Quantity) {
    const length = this._images.length;
    if (!(index.value < length - 1) && index.value !== length - 1)
      throw new BadRequestError('The selected image does not exist in this product.');
    for (let i = 0; i <= length - 1; i++) {
      this._images[i].setDefault(false);
    }

    return this._images[index.value].setDefault(true);
  }

  last(): ImageVO | undefined {
    return this._images.at(-1);
  }

  getDefault(): ImageVO | undefined {
    return this._images.find((image) => image.isDefault);
  }

  has(url: UrlVO): boolean {
    return this._images.some((image) => image.url.equals(url));
  }

  add(images: ImageVO | ImageVO[]): ImagesVO {
    const items = Array.isArray(images) ? images : [images];

    return ImagesVO.create([...this._images, ...items]);
  }

  remove(urls: UrlVO | UrlVO[]): ImagesVO {
    const values = new Set((Array.isArray(urls) ? urls : [urls]).map((url) => url.value));

    const remaining = this._images.filter((image) => !values.has(image.url.value));

    if (remaining.length === 0) {
      throw new BadRequestError('At least one product image is required.');
    }

    return ImagesVO.create(remaining);
  }

  equals(other: ImagesVO): boolean {
    if (this.length !== other.length) {
      return false;
    }

    return this._images.every((image, index) => image.equals(other._images[index]));
  }

  toObject() {
    return this._images.map((image) => image.toObject());
  }
}
