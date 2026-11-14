export interface CartLineResponseReadModel {
  id: string;
  variantId: string;
  quantity: number;
}

export interface CartResponseReadModel {
  id: string;
  buyerId: string;
  items: CartLineResponseReadModel[];
  createdAt: Date;
}

/** One order was created for the selected lines, whatever vendors it spans. */
export interface CartCheckoutResponseReadModel {
  orderId: string;
  orderType: string;
  vendorIds: string[];
  totalPrice: number;
  createdAt: Date;
}

export interface CartCheckedOutReadModel {
  cart: CartResponseReadModel;
  order: CartCheckoutResponseReadModel;
}
