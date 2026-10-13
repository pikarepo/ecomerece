export interface InventoryReadModel {
  id: string;
  variantId: string;
  available: number;
  reserved: number;
  lowStockThreshold: number;
  deleted: {
    deleted: boolean;
    deletedFrom: Date | null;
    deletedBy: string | null;
    reason: string | null;
  };
  createdAt: Date;
}
