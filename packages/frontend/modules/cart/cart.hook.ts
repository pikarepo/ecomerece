// cart.hook.ts

import {
  addCartItemDto,
  type addCartItemDtoType,
  checkoutCartDto,
  type checkoutCartDtoType,
  type deleteCartDtoType,
} from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from './cart.service';

export const CART_QUERY_KEY = ['cart'];

export function useGetMyCart() {
  return useQuery({
    queryKey: [...CART_QUERY_KEY, 'my'],
    queryFn: () => cartService.getMyCart(),
  });
}

function invalidateCart(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
}

export function useInitMyCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartService.initMyCart(),
    onSuccess: () => invalidateCart(queryClient),
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: addCartItemDtoType) => cartService.addItem(addCartItemDto.parse(data)),
    onSuccess: () => invalidateCart(queryClient),
  });
}

export function useCheckoutCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: checkoutCartDtoType) =>
      cartService.checkoutItems(checkoutCartDto.parse(data)),
    onSuccess: () => invalidateCart(queryClient),
  });
}

export function useDeleteCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: deleteCartDtoType }) =>
      cartService.deleteCart(id, data),
    onSuccess: () => invalidateCart(queryClient),
  });
}
