import { eventBus } from '../../core/infrastructure/buses/in-memory-event-bus';
import { createImageStorageModule } from '../image-storage/image-storage.module';
import { HomeAppService } from './application/home.app.service';

import { HomeRepository } from './infrastructure/home.repository';
import { HomeController } from './presentation/home.controller';

export const createHomeModule = () => {
  const homeRepo = new HomeRepository();
  const homeAppSvc = new HomeAppService(homeRepo, eventBus, createImageStorageModule());
  const homeController = new HomeController(homeAppSvc);

  return { homeAppSvc, homeController };
};
