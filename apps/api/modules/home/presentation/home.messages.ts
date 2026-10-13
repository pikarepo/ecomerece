export type HomeMessagesType = { message: string };
export const HomeMessages = {
  categoryAdded: (actor: string) => ({
    message: `A new category was added to the homepage by ${actor}.`,
  }),
  categoryUpdated: (id: string, actor: string) => ({
    message: `Category ${id} was updated by ${actor}.`,
  }),
  categoryRemoved: (id: string, actor: string) => ({
    message: `Category ${id} was removed from the homepage by ${actor}.`,
  }),
  categoriesReordered: (actor: string) => ({
    message: `The homepage categories were reordered by ${actor}.`,
  }),
  slideAdded: (actor: string) => ({ message: `A new hero slide was added by ${actor}.` }),
  slideUpdated: (id: string, actor: string) => ({
    message: `Slide ${id} was updated by ${actor}.`,
  }),
  slideRemoved: (id: string, actor: string) => ({
    message: `Slide ${id} was removed by ${actor}.`,
  }),
  slidesReordered: (actor: string) => ({ message: `The hero slides were reordered by ${actor}.` }),
  promoAdded: (actor: string) => ({ message: `A new promo banner was added by ${actor}.` }),
  promoUpdated: (id: string, actor: string) => ({
    message: `Promo ${id} was updated by ${actor}.`,
  }),
  promoRemoved: (id: string, actor: string) => ({
    message: `Promo ${id} was removed by ${actor}.`,
  }),
  featureAdded: (actor: string) => ({ message: `A new feature was added by ${actor}.` }),
  featureUpdated: (id: string, actor: string) => ({
    message: `Feature ${id} was updated by ${actor}.`,
  }),
  featureRemoved: (id: string, actor: string) => ({
    message: `Feature ${id} was removed by ${actor}.`,
  }),
  featuresSet: (actor: string) => ({ message: `The feature set was updated by ${actor}.` }),
  containerAdded: (id: string, actor: string) => ({
    message: `Container ${id} was added by ${actor}.`,
  }),
  containerUpdated: (id: string, actor: string) => ({
    message: `Container ${id} was updated by ${actor}.`,
  }),
  containerRemoved: (id: string, actor: string) => ({
    message: `Container ${id} was removed by ${actor}.`,
  }),
  containersReordered: (actor: string) => ({
    message: `The containers were reordered by ${actor}.`,
  }),
};
