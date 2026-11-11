import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { HomeAppService } from './application/home.app.service';
import { GetHomeQuery } from './application/queries/get-home.query';
import { GetHomeHandler } from './application/query-handlers/get-home.query-handler';

import { HomeRepository } from './infrastructure/home.repository';
import { HomeController } from './presentation/home.controller';

interface HomeModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export const createHomeModule = ({ queryBus, eventBus, imageStorage }: HomeModuleDeps) => {
  const homeRepo = new HomeRepository();
  const homeAppSvc = new HomeAppService(homeRepo, eventBus, imageStorage);
  queryBus.register(GetHomeQuery, new GetHomeHandler(homeAppSvc));
  const homeController = new HomeController(homeAppSvc);

  return { homeAppSvc, homeController };
};
