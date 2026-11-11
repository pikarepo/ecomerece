import type { HomeAppService } from '../home.app.service';
import type { GetHomeQuery, GetHomeResult } from '../queries/get-home.query';

export class GetHomeHandler {
  readonly type = 'GetHomeQuery';
  constructor(private readonly appService: HomeAppService) {}

  async handle(_query: GetHomeQuery): Promise<GetHomeResult> {
    return await this.appService.getHome();
  }
}
