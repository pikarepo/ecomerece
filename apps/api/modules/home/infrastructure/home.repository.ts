import { HomeAggregate, type IHomeRepository } from '@ecomerece/domain';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { getCurrentSession } from '../../../core/database/transaction-context';
import { ConcurrencyError, NotFoundError } from '../../../errors/app-error';
import { HomeMapper } from './home.mapper';
import { HomeModel, type HomePersistence } from './home.models';

export const DEFAULT_HOME_ID = 'home-main';

export class HomeRepository implements IHomeRepository {
  private get session() {
    return getCurrentSession();
  }

  async findById(id: Id): Promise<HomeAggregate | null> {
    const doc = await HomeModel.findById(id.value)
      .session(this.session ?? null)
      .lean();
    return doc ? HomeMapper.persistenceToAggregate(doc as any) : null;
  }

  async getHomeMain(): Promise<HomeAggregate> {
    const id = Id.create(DEFAULT_HOME_ID);
    const existing = await this.findById(id);
    if (existing) {
      return existing;
    }

    const newHome = HomeAggregate.create(id);
    try {
      await this.create(newHome);
      return newHome;
    } catch (error: any) {
      if (error?.code === 11000 || error?.name === 'MongoServerError') {
        const retry = await this.findById(id);
        if (retry) {
          return retry;
        }
      }
      throw error;
    }
  }

  async save(home: HomeAggregate): Promise<void> {
    const currentVersion = home.version.value;
    home.incrementVersion();
    const data = HomeMapper.aggregateToPersistence(home);

    const result = await HomeModel.updateOne(
      { _id: home.id.value, version: currentVersion },
      { $set: data },
      { session: this.session },
    );

    if (result.matchedCount === 0) {
      const exists = await HomeModel.exists({ _id: home.id.value }).session(this.session ?? null);
      if (!exists) {
        throw new NotFoundError(`The homepage layout '${home.id.value}' was not found.`);
      }
      throw new ConcurrencyError(
        'Home aggregate was modified by another process. Please refresh and try again.',
      );
    }
  }

  async create(home: HomeAggregate): Promise<void> {
    const data = HomeMapper.aggregateToPersistence(home);
    const doc = new HomeModel(data);
    await doc.save({ session: this.session });
  }
}
