import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { HomeAppService } from './application/home.app.service';
import { HomeRepository } from './infrastructure/home.repository';
import { HomeController } from './presentation/home.controller';

interface HomeModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export const createHomeModule = ({ eventBus, imageStorage }: HomeModuleDeps) => {
  const homeRepo = new HomeRepository();
  const homeAppSvc = new HomeAppService(homeRepo, eventBus, imageStorage);
  const homeController = new HomeController(homeAppSvc);

  return { homeAppSvc, homeController };
};
