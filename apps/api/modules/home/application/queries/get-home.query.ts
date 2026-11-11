import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { HomeAppService } from '../home.app.service';

export type GetHomeResult = Awaited<ReturnType<HomeAppService['getHome']>>;

export class GetHomeQuery implements IQuery<GetHomeResult> {
  readonly __result?: GetHomeResult;
  readonly type = 'GetHomeQuery';

  constructor(..._args: unknown[]) {}
}
