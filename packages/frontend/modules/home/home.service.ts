import type {
  CreateFeatureDtoType,
  CreateHomeCategoryDtoType,
  CreateProductContainerDtoType,
  CreatePromoDtoType,
  CreateSlideDtoType,
  DeleteFeatureDtoType,
  DeleteHomeCategoryDtoType,
  DeleteProductContainerDtoType,
  DeletePromoDtoType,
  DeleteSlideDtoType,
  HomeResponseReadModel,
  ReorderHomeCategoriesDtoType,
  ReorderProductContainersDtoType,
  ReorderSlidesDtoType,
  SetFeaturesDtoType,
  UpdateFeatureDtoType,
  UpdateHomeCategoryDtoType,
  UpdateProductContainerDtoType,
  UpdatePromoDtoType,
  UpdateSlideDtoType,
} from '@ecomerece/shared';
import { http } from '../../lib';

export type HomeMutationResult = {
  message: string;
};

export class HomeService {
  getHomeLayout(): Promise<HomeResponseReadModel> {
    return http.get<HomeResponseReadModel>('/home');
  }

  // Categories
  addCategory(data: CreateHomeCategoryDtoType): Promise<HomeMutationResult> {
    return http.post<HomeMutationResult>('/home/categories', data);
  }
  updateCategory(data: UpdateHomeCategoryDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/categories', data);
  }
  removeCategory(data: DeleteHomeCategoryDtoType): Promise<HomeMutationResult> {
    return http.delete<HomeMutationResult>('/home/categories', data);
  }
  reorderCategories(data: ReorderHomeCategoriesDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/categories/reorder', data);
  }

  // Slides
  addSlide(data: CreateSlideDtoType): Promise<HomeMutationResult> {
    return http.post<HomeMutationResult>('/home/slides', data);
  }
  updateSlide(data: UpdateSlideDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/slides', data);
  }
  removeSlide(data: DeleteSlideDtoType): Promise<HomeMutationResult> {
    return http.delete<HomeMutationResult>('/home/slides', data);
  }
  reorderSlides(data: ReorderSlidesDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/slides/reorder', data);
  }

  // Promos
  addPromo(data: CreatePromoDtoType): Promise<HomeMutationResult> {
    return http.post<HomeMutationResult>('/home/promos', data);
  }
  updatePromo(data: UpdatePromoDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/promos', data);
  }
  removePromo(data: DeletePromoDtoType): Promise<HomeMutationResult> {
    return http.delete<HomeMutationResult>('/home/promos', data);
  }

  // Features
  addFeature(data: CreateFeatureDtoType): Promise<HomeMutationResult> {
    return http.post<HomeMutationResult>('/home/features', data);
  }
  setFeatures(data: SetFeaturesDtoType): Promise<HomeMutationResult> {
    return http.put<HomeMutationResult>('/home/features', data);
  }
  updateFeature(data: UpdateFeatureDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/features', data);
  }
  removeFeature(data: DeleteFeatureDtoType): Promise<HomeMutationResult> {
    return http.delete<HomeMutationResult>('/home/features', data);
  }

  // Containers
  addContainer(data: CreateProductContainerDtoType): Promise<HomeMutationResult> {
    return http.post<HomeMutationResult>('/home/containers', data);
  }
  updateContainer(data: UpdateProductContainerDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/containers', data);
  }
  removeContainer(data: DeleteProductContainerDtoType): Promise<HomeMutationResult> {
    return http.delete<HomeMutationResult>('/home/containers', data);
  }
  reorderContainers(data: ReorderProductContainersDtoType): Promise<HomeMutationResult> {
    return http.patch<HomeMutationResult>('/home/containers/reorder', data);
  }
}

export const homeService = new HomeService();
