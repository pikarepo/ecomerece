export interface CartLineReadModel {
  id: string;
  variantId: string;
  quantity: number;
  addedAt: Date;
}

export interface CartReadModel {
  id: string;
  buyerId: string;
  items: CartLineReadModel[];
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };
  createdAt: Date;
}
