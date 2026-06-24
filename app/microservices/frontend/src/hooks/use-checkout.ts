import { useMutation } from "@tanstack/react-query";

import { createOrder, type CreateOrderRequest } from "@/api";

export function useCheckout() {
  return useMutation({
    mutationFn: (order: CreateOrderRequest) => createOrder(order),
  });
}
