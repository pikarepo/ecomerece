import type { categoryReadModels, Id, IQuery } from '@ecomerece/domain';

export class VerifyCategoryAndGetQuery
  implements IQuery<{ isValid: boolean; category: null | categoryReadModels }>
{
  readonly __result?: { isValid: boolean; category: null | categoryReadModels };
  readonly type = 'VerifyCategoryAndGetQuery';
  public readonly payload: { id: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ id: Id }];
    this.payload = payload;
  }
}
