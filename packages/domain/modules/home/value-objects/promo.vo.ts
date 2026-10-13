import { Id, type Title, UrlVO } from '../../../value-objects';
import type { ColorVO } from '../../../value-objects/color.vo';
import type { ImageKey } from '../../image-storage/value-objects/image-key.vo';

export type PromoVOProps = {
  id?: Id;
  title: Title;
  subtitle: Title;
  image: UrlVO;
  accent: ColorVO;
  link?: UrlVO;
  imageKey?: ImageKey;
};

export class PromoVO {
  private constructor(
    private readonly _id: Id,
    private readonly _title: Title,
    private readonly _subtitle: Title,
    private readonly _image: UrlVO,
    private readonly _accent: ColorVO,
    private readonly _link: UrlVO,
    private readonly _imageKey?: ImageKey,
  ) {}

  get id(): Id {
    return this._id;
  }
  get title(): Title {
    return this._title;
  }
  get subtitle(): Title {
    return this._subtitle;
  }
  get image(): UrlVO {
    return this._image;
  }
  get accent(): ColorVO {
    return this._accent;
  }
  get link(): UrlVO {
    return this._link;
  }
  get imageKey(): ImageKey | undefined {
    return this._imageKey;
  }

  static create(props: PromoVOProps): PromoVO {
    return new PromoVO(
      props.id ?? Id.create(),
      props.title,
      props.subtitle,
      props.image,
      props.accent,
      props.link ?? UrlVO.create('https://example.com/client/home'),
      props.imageKey,
    );
  }

  static rehydrate(
    id: Id,
    title: Title,
    subtitle: Title,
    image: UrlVO,
    accent: ColorVO,
    link: UrlVO,
    imageKey?: ImageKey,
  ): PromoVO {
    return new PromoVO(id, title, subtitle, image, accent, link, imageKey);
  }
}
