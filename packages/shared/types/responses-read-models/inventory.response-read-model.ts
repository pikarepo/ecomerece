export interface InventoryResponseReadModel {
  id: string;
  variantId: string;
  available: number;
  reserved: number;
  soldOut: number;
  lowStockThreshold: number;
  createdAt: Date;
}
