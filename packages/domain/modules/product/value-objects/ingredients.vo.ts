import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import { Title } from '../../../value-objects';

export interface IngredientsProps {
  isIngredients: boolean;
  items: Title[];
}

export class IngredientsVO {
  private constructor(
    public readonly isIngredients: boolean,
    private items: readonly Title[],
  ) {}

  static create(props: IngredientsProps): IngredientsVO {
    return new IngredientsVO(props.isIngredients, props.items);
  }

  static rehydrate(isIngredients: boolean, items: Title[]): IngredientsVO {
    return new IngredientsVO(isIngredients, items);
  }

  get value(): readonly Title[] {
    return this.items;
  }

  get length(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  has(item: string): boolean {
    const title = Title.create(item);
    return this.items.some((i) => i.equals(title));
  }

  add(item: string) {
    if (!this.isIngredients) {
      throw new BadRequestError('Ingredients are disabled.');
    }

    const title = Title.create(item);

    if (this.has(title.value)) {
      throw new BadRequestError(`Ingredient "${title.value}" already exists.`);
    }
    this.items = [...this.items, title];
  }

  remove(item: string) {
    if (!this.isIngredients) {
      throw new BadRequestError('Ingredients are disabled.');
    }

    const title = Title.create(item);

    this.items = this.items.filter((i) => !i.equals(title));
  }

  clear(): IngredientsVO {
    return new IngredientsVO(this.isIngredients, []);
  }

  enable(): IngredientsVO {
    return new IngredientsVO(true, this.items);
  }

  disable(clearItems = true): IngredientsVO {
    return new IngredientsVO(false, clearItems ? [] : this.items);
  }

  toObject(): string[] {
    return this.items.map((i) => i.value);
  }

  equals(other: IngredientsVO): boolean {
    if (this.isIngredients !== other.isIngredients || this.items.length !== other.items.length) {
      return false;
    }

    return this.items.every((item, index) => item.equals(other.items[index]));
  }
}
