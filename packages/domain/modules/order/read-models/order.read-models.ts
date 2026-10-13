export interface OrderReadModel {
  id: string;
  buyerId: string;
  totalPrice: number;
  address: string;
  deleted: {
    deleted: boolean;
    deletedFrom?: Date | null;
    deletedBy?: string | null;
    reason?: string | null;
  };

  createdAt: Date;
}
