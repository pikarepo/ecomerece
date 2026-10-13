import type { Id } from '../../../value-objects/id.vo';
import type { HomeAggregate } from '../home.aggregate';

export interface IHomeRepository {
  findById(id: Id): Promise<HomeAggregate | null>;
  getHomeMain(): Promise<HomeAggregate>;
  save(home: HomeAggregate): Promise<void>;
  create(home: HomeAggregate): Promise<void>;
}
