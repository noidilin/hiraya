import { z } from "zod";

import { apiGet, apiPost } from "./client";
import {
  createOrderRequestSchema,
  normalizeOrder,
  orderWireSchema,
  type CreateOrderRequest,
  type Order,
} from "./schemas";

export async function createOrder(order: CreateOrderRequest): Promise<Order> {
  const payload = createOrderRequestSchema.parse(order);
  const createdOrder = await apiPost("/orders", payload, orderWireSchema);
  return normalizeOrder(createdOrder);
}

const orderHistoryWireSchema = z.object({
  orders: z.array(orderWireSchema),
});

export async function listMyOrders(userId?: string): Promise<Order[]> {
  const orderHistory = await apiGet("/orders/my-orders", orderHistoryWireSchema, { userId });
  return orderHistory.orders.map(normalizeOrder);
}
