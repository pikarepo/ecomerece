import { EnumVO } from './enum.vo';

export const APPEARANCE = ['public', 'private'] as const;

export type AppearanceType = (typeof APPEARANCE)[number];

export class AppearanceVO extends EnumVO<AppearanceType> {
  private constructor(value: AppearanceType) {
    super(value, APPEARANCE);
  }

  static create(value: string): AppearanceVO {
    return new AppearanceVO(value.toLowerCase() as AppearanceType);
  }

  get isPublic(): boolean {
    return this.value === 'public';
  }

  get isPrivate(): boolean {
    return this.value === 'private';
  }

  makePublic(): AppearanceVO {
    return AppearanceVO.create('public');
  }

  makePrivate(): AppearanceVO {
    return AppearanceVO.create('private');
  }
}
