import { BadRequestError } from '../../../apps/api/errors/app-error';
import { StringVO } from './string-vo';

export class Slug extends StringVO {
  private constructor(value: string) {
    super(value.trim().toLowerCase());
  }

  static create(value: string): Slug {
    return new Slug(value);
  }

  protected override validate(value: string): void {
    super.validate(value);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      throw new BadRequestError('Slug may only contain lowercase letters, numbers, and hyphens.');
    }
  }

  get segments(): readonly string[] {
    return this.value.split('-');
  }

  get firstSegment(): string {
    return this.segments[0];
  }

  get lastSegment(): string {
    return this.segments[this.segments.length - 1];
  }

  get segmentCount(): number {
    return this.segments.length;
  }

  startsWithSegment(segment: string): boolean {
    return this.firstSegment === segment.toLowerCase();
  }

  endsWithSegment(segment: string): boolean {
    return this.lastSegment === segment.toLowerCase();
  }

  containsSegment(segment: string): boolean {
    return this.segments.includes(segment.toLowerCase());
  }

  append(segment: string): Slug {
    return Slug.create(`${this.value}-${segment}`);
  }

  prepend(segment: string): Slug {
    return Slug.create(`${segment}-${this.value}`);
  }

  parent(): Slug | null {
    if (this.segmentCount <= 1) {
      return null;
    }

    return Slug.create(this.segments.slice(0, -1).join('-'));
  }

  child(segment: string): Slug {
    return this.append(segment);
  }

  replaceSegment(oldSegment: string, newSegment: string): Slug {
    return Slug.create(
      this.segments
        .map((segment) =>
          segment === oldSegment.toLowerCase() ? newSegment.toLowerCase() : segment,
        )
        .join('-'),
    );
  }

  toPath(): string {
    return `/${this.segments.join('/')}`;
  }
}
