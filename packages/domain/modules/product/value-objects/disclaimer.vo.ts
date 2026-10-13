import { BadRequestError } from '../../../../../apps/api/errors/app-error';
import { Title } from '../../../value-objects';

export interface DisclaimerItem {
  name: Title;
  title: Title;
}

export interface DisclaimerProps {
  isDisclaimer: boolean;
  items: DisclaimerItem[];
}

export class DisclaimerVO {
  private constructor(
    public readonly isDisclaimer: boolean,
    public readonly items: readonly DisclaimerItem[],
  ) {
    Object.freeze(this.items);
    Object.freeze(this);
  }

  static create(props: DisclaimerProps): DisclaimerVO {
    return new DisclaimerVO(props.isDisclaimer, props.items);
  }

  static rehydrate(isDisclaimer: boolean, items: DisclaimerItem[]): DisclaimerVO {
    return new DisclaimerVO(isDisclaimer, items);
  }

  enable(): DisclaimerVO {
    return new DisclaimerVO(true, this.items);
  }

  disable(clear = true): DisclaimerVO {
    return new DisclaimerVO(false, clear ? [] : this.items);
  }

  has(name: string): boolean {
    const value = Title.create(name);
    return this.items.some((item) => item.name.equals(value));
  }

  addMany(data: DisclaimerItem[]): DisclaimerVO {
    if (!this.isDisclaimer) throw new BadRequestError('Disclaimer is disabled.');
    data.map((value) => {
      if (this.has(value.name.value))
        throw new BadRequestError(`Disclaimer "${value.name.value}" already exists.`);
    });
    return new DisclaimerVO(true, [...this.items, ...data]);
  }

  removeMany(data: DisclaimerItem[]): DisclaimerVO {
    if (!this.isDisclaimer) throw new BadRequestError('Disclaimer is disabled.');
    let items = this.items;
    data.map((value) => (items = items.filter((item) => !item.name.equals(value.name))));
    return new DisclaimerVO(true, items);
  }

  add(name: string, title: string): DisclaimerVO {
    if (!this.isDisclaimer) throw new BadRequestError('Disclaimer is disabled.');
    const disclaimer: DisclaimerItem = {
      name: Title.create(name),
      title: Title.create(title),
    };
    if (this.has(name)) {
      throw new BadRequestError(`Disclaimer "${name}" already exists.`);
    }

    return new DisclaimerVO(true, [...this.items, disclaimer]);
  }

  remove(name: string): DisclaimerVO {
    if (!this.isDisclaimer) {
      throw new BadRequestError('Disclaimer is disabled.');
    }

    const value = Title.create(name);

    return new DisclaimerVO(
      true,
      this.items.filter((item) => !item.name.equals(value)),
    );
  }

  update(name: string, title: string): DisclaimerVO {
    if (!this.isDisclaimer) {
      throw new BadRequestError('Disclaimer is disabled.');
    }

    const nameVO = Title.create(name);
    const titleVO = Title.create(title);

    return new DisclaimerVO(
      true,
      this.items.map((item) =>
        item.name.equals(nameVO)
          ? {
              name: nameVO,
              title: titleVO,
            }
          : item,
      ),
    );
  }

  clear(): DisclaimerVO {
    return new DisclaimerVO(this.isDisclaimer, []);
  }

  toObject() {
    return {
      isDisclaimer: this.isDisclaimer,
      items: this.items.map((item) => ({
        name: item.name.value,
        title: item.title.value,
      })),
    };
  }

  equals(other: DisclaimerVO): boolean {
    if (this.isDisclaimer !== other.isDisclaimer || this.items.length !== other.items.length) {
      return false;
    }

    return this.items.every(
      (item, index) =>
        item.name.equals(other.items[index].name) && item.title.equals(other.items[index].title),
    );
  }
}
