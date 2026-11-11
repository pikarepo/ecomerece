export interface OrderResponseReadModel {
  id: string;
  buyerId: string;
  totalPrice: number;
  address: string;
  status: string;
  createdAt: Date;
}
