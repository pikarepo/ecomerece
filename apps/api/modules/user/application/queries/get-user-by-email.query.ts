import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { EmailVO } from '@ecomerece/domain/value-objects/email.vo';
import type { UserInternalService } from '../user.internal.service';

export type GetUserByEmailResult = Awaited<ReturnType<UserInternalService['getByEmail']>>;

export class GetUserByEmailQuery implements IQuery<GetUserByEmailResult> {
  readonly __result?: GetUserByEmailResult;
  readonly type = 'GetUserByEmailQuery';
  public readonly payload: { email: EmailVO };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ email: EmailVO }];
    this.payload = payload;
  }
}
