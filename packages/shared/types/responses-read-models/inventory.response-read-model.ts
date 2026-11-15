/**
 * Buyer-facing availability. Reservations, low-stock thresholds and audit
 * timestamps stay internal: they describe the vendor's operation, not the stock.
 */
export interface InventoryPublicResponseReadModel {
  variantId: string;
  available: number;
  inStock: boolean;
}

export interface InventoryResponseReadModel {
  id: string;
  variantId: string;
  available: number;
  reserved: number;
  soldOut: number;
  lowStockThreshold: number;
  createdAt: Date;
}
