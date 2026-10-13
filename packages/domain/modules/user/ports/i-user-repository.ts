import type { EmailVO, Id } from '../../../value-objects';
import type { UserAggregate } from '../user.aggregate';

export interface IUserRepository {
  FindById(id: Id): Promise<UserAggregate | null>;
  FindByEmail(email: EmailVO): Promise<UserAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<UserAggregate>;
  FindByIds(id: Id[]): Promise<UserAggregate[]>;
  FindByEmailOrThrow(email: EmailVO): Promise<UserAggregate>;
  Save(user: UserAggregate): Promise<void>;
  Create(add: UserAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
