import {
  selectCartItemCount,
  selectCartItems,
  selectCartLineTotal,
  selectCartSubtotal,
  useCartStore,
} from "@/stores/cart-store";

export function useCart() {
  return useCartStore();
}

export function useCartItems() {
  return useCartStore(selectCartItems);
}

export function useCartItemCount() {
  return useCartStore(selectCartItemCount);
}

export function useCartSubtotal() {
  return useCartStore(selectCartSubtotal);
}

export function useCartLineTotal(productId: string) {
  return useCartStore(selectCartLineTotal(productId));
}

export { useCartStore };
