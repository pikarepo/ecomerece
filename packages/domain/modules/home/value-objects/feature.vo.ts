import { type Description, type IconVO, Id, type Title } from '../../../value-objects';
import type { ColorVO } from '../../../value-objects/color.vo';

export type FeatureVOProps = {
  id?: Id;
  title: Title;
  detail: Description;
  accent: ColorVO;
  icon?: IconVO;
};

export class FeatureVO {
  private constructor(
    private readonly _id: Id,
    private readonly _title: Title,
    private readonly _detail: Description,
    private readonly _accent: ColorVO,
    private readonly _icon?: IconVO,
  ) {}

  get id(): Id {
    return this._id;
  }
  get title(): Title {
    return this._title;
  }
  get detail(): Description {
    return this._detail;
  }
  get accent(): ColorVO {
    return this._accent;
  }
  get icon(): IconVO | undefined {
    return this._icon;
  }

  static create(props: FeatureVOProps): FeatureVO {
    return new FeatureVO(
      props.id ?? Id.create(),
      props.title,
      props.detail,
      props.accent,
      props.icon,
    );
  }

  static rehydrate(
    id: Id,
    title: Title,
    detail: Description,
    accent: ColorVO,
    icon?: IconVO,
  ): FeatureVO {
    return new FeatureVO(id, title, detail, accent, icon);
  }
}
