export type HomeCategoryReadModel = {
  id: string;
  name: string;
  image: string;
  accent: string;
  icon: string;
};

export type HomeFeatureReadModel = {
  id: string;
  title: string;
  detail: string;
  accent: string;
  icon: string;
};

export type HomeSlideReadModel = {
  id: string;
  tag: string;
  title: string;
  subhead: string;
  subtitle: string;
  cta: string;
  image: string;
  accent: string;
  displayOrder: number;
};

export type HomePromoReadModel = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  link: string;
};

export type HomeContainerReadModel = {
  id: string;
  heading: string;
  subTitle: string;
  query: {
    filter?: Record<string, unknown>;
    cursor?: string | null;
    limit?: number;
    direction?: 'next' | 'prev';
    sort?: Record<string, 1 | -1> | null;
  };
  displayOrder: number;
};

export type HomeReadModel = {
  id: string;
  categories: HomeCategoryReadModel[];
  features: HomeFeatureReadModel[];
  slides: HomeSlideReadModel[];
  promos: HomePromoReadModel[];
  productContainers: HomeContainerReadModel[];
  version: number;
  updatedAt: Date;
};
