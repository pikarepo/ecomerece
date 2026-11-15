import type { UrlVO } from '../../../value-objects/url.vo';

/** Evidence image attached to a return/refund request. */
export class OrderRequestImageVO {
  private constructor(
    readonly url: UrlVO,
    readonly key: string | null,
  ) {}

  static create(url: UrlVO, key?: string | null): OrderRequestImageVO {
    return new OrderRequestImageVO(url, key ?? null);
  }

  static rehydrate(url: UrlVO, key?: string | null): OrderRequestImageVO {
    return new OrderRequestImageVO(url, key ?? null);
  }

  equals(other: OrderRequestImageVO): boolean {
    return this.url.equals(other.url) && this.key === other.key;
  }
}
