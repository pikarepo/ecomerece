export interface ProductVariantReadModel {
  productId: string;
  id: string;
  discountedPrice: number;
  price: number;
  active: boolean;
  title: string;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };

  createdAt: Date;
}
