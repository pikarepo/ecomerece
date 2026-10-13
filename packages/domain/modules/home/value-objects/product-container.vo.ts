import type { Id, Quantity, Title } from '../../../value-objects';
import type { BaseQueryVO } from '../../../value-objects/query.vo';

export type ProductContainerProps = {
  id: Id;
  heading: Title;
  subTitle: Title;
  query: BaseQueryVO;
  displayOrder: Quantity;
};

export class ProductContainerVO {
  private constructor(
    private readonly _id: Id,
    private readonly _heading: Title,
    private readonly _subTitle: Title,
    private readonly _query: BaseQueryVO,
    private _displayOrder: Quantity,
  ) {}

  get id(): Id {
    return this._id;
  }
  get heading(): Title {
    return this._heading;
  }
  get subTitle(): Title {
    return this._subTitle;
  }
  get query(): BaseQueryVO {
    return this._query;
  }
  get displayOrder(): Quantity {
    return this._displayOrder;
  }

  updateDisplayOrder(newOrder: Quantity): void {
    this._displayOrder = newOrder;
  }

  static create(props: ProductContainerProps): ProductContainerVO {
    return new ProductContainerVO(
      props.id,
      props.heading,
      props.subTitle,
      props.query,
      props.displayOrder,
    );
  }

  static rehydrate(
    id: Id,
    heading: Title,
    subTitle: Title,
    query: BaseQueryVO,
    displayOrder: Quantity,
  ): ProductContainerVO {
    return new ProductContainerVO(id, heading, subTitle, query, displayOrder);
  }
}
