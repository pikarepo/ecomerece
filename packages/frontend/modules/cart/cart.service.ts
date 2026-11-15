// cart.service.ts

import type {
  addCartItemDtoType,
  CartCheckedOutReadModel,
  CartResponseReadModel,
  checkoutCartDtoType,
  deleteCartDtoType,
} from '@ecomerece/shared';
import { http } from './../../lib';

export type CartMutationResult = {
  message: string;
  updatedData?: CartResponseReadModel;
};

export type CartCheckoutResult = {
  message: string;
  updatedData?: CartCheckedOutReadModel;
};

export class CartService {
  /** Null until the cart has been provisioned for the caller. */
  getMyCart(): Promise<CartResponseReadModel | null> {
    return http.get<CartResponseReadModel | null>('/cart/my');
  }

  initMyCart(): Promise<CartMutationResult> {
    return http.post<CartMutationResult>('/cart/my', {});
  }

  addItem(data: addCartItemDtoType): Promise<CartMutationResult> {
    return http.post<CartMutationResult>('/cart/my/items', data);
  }

  checkoutItems(data: checkoutCartDtoType): Promise<CartCheckoutResult> {
    return http.post<CartCheckoutResult>('/cart/my/checkout', data);
  }

  /** Admin: remove somebody else's cart. There is no buyer-facing delete. */
  deleteCart(id: string, data: deleteCartDtoType): Promise<CartMutationResult> {
    return http.delete<CartMutationResult>(`/cart/admin/${id}`, data);
  }
}

export const cartService = new CartService();
