import type { IUserRepository, UserAggregate } from '@ecomerece/domain';
import type { EmailVO } from '@ecomerece/domain/value-objects/email.vo';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import type { FilterQuery } from 'mongoose';
import { MongoRepository } from '../../../core/repository/mongo.repository';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { UserMapper } from './user.mapper';
import { UserModel, type UserPersistence } from './user.models';

export class UserRepository extends MongoRepository<UserPersistence> implements IUserRepository {
  constructor() {
    super(UserModel);
  }
  async FindById(id: Id): Promise<UserAggregate | null> {
    const doc = await super.findById(id.value);
    if (!doc) return null;
    return UserMapper.persistenceToAggregate(doc);
  }

  async FindByIds(id: Id[]): Promise<UserAggregate[]> {
    const ids = id.map((value) => value.value);
    const filter = {
      _id: { $in: ids },
    };

    const docs = await super.find(filter);
    return docs.map((value) => UserMapper.persistenceToAggregate(value));
  }

  async FindByEmail(email: EmailVO): Promise<UserAggregate | null> {
    const doc = await super.findOne({ email: email.value });
    if (!doc) return null;
    return UserMapper.persistenceToAggregate(doc);
  }

  async FindByIdOrThrow(id: Id): Promise<UserAggregate> {
    const doc = await super.findById(id.value);
    if (!doc) throw new NotFoundError('User not found.');
    return UserMapper.persistenceToAggregate(doc);
  }
  async FindByEmailOrThrow(email: EmailVO): Promise<UserAggregate> {
    const doc = await super.findOne({ email: email.value });
    if (!doc) throw new NotFoundError('No user exists with this email.');
    return UserMapper.persistenceToAggregate(doc);
  }

  async Save(user: UserAggregate): Promise<void> {
    const data = UserMapper.aggregateToPersistence(user);

    const result = await UserModel.updateOne(
      { _id: user.id.value, version: user.version.value },
      {
        $set: data,
        $inc: { version: 1 },
      },
    );

    if (result.modifiedCount === 0) throw new ConcurrencyError();
  }

  async Delete(id: Id): Promise<void> {
    await super.findByIdAndDelete(id.value);
  }
  async Create(add: UserAggregate): Promise<void> {
    const persistantUser = UserMapper.aggregateToPersistence(add);
    const userDoc = new UserModel(persistantUser);

    await super.create(userDoc);
  }

  async Exists(id: Id): Promise<boolean> {
    return !!(await super.exists({
      _id: id.value,
    }));
  }

  async FindPaginated(params: {
    filter?: FilterQuery<UserPersistence>;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: UserAggregate[];
    meta: { nextCursor: string | null; prevCursor: string | null; hasMore: boolean };
  }> {
    const result = await this.paginateByCursor({
      filter: params.filter,
      cursor: params.cursor?.value,
      limit: params.limit?.value,
      direction: params.direction,
    });
    return {
      data: result.data.map((doc) => UserMapper.persistenceToAggregate(doc as UserPersistence)),
      meta: result.meta,
    };
  }
}
