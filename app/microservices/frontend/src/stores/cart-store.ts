import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Product } from "@/api";

export type CartProductSnapshot = {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  brand?: string;
  inventory?: number;
};

export type CartItem = CartProductSnapshot & {
  quantity: number;
};

type CartItemIdentity = { id: string; productId?: string } | { id?: string; productId: string };

export type AddCartItemInput = CartItemIdentity & {
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  brand?: string;
  inventory?: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: AddCartItemInput | Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementItem: (productId: string, amount?: number) => void;
  decrementItem: (productId: string, amount?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getLineTotal: (productId: string) => number;
};

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.floor(quantity);
}

function normalizePositiveQuantity(quantity: number): number {
  return Math.max(0, normalizeQuantity(quantity));
}

function capQuantity(quantity: number, inventory?: number): number {
  const nextQuantity = normalizeQuantity(quantity);

  if (nextQuantity <= 0) {
    return 0;
  }

  if (inventory === undefined) {
    return nextQuantity;
  }

  return Math.min(nextQuantity, Math.max(0, normalizeQuantity(inventory)));
}

function getProductId(item: AddCartItemInput | Product): string {
  const productId = "productId" in item ? item.productId : undefined;

  if (productId) {
    return productId;
  }

  if (item.id) {
    return item.id;
  }

  throw new Error("Cart items require an id or productId.");
}

function toCartSnapshot(item: AddCartItemInput | Product): CartProductSnapshot {
  const productId = getProductId(item);

  return {
    id: productId,
    productId,
    name: item.name,
    price: item.price,
    imageUrl: item.imageUrl,
    ...(item.category ? { category: item.category } : {}),
    ...(item.brand ? { brand: item.brand } : {}),
    ...(item.inventory === undefined ? {} : { inventory: item.inventory }),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item, quantity = 1) {
        const snapshot = toCartSnapshot(item);
        const quantityToAdd = normalizePositiveQuantity(quantity);

        if (quantityToAdd <= 0) {
          return;
        }

        set((state) => {
          const existingItem = state.items.find((cartItem) => cartItem.productId === snapshot.productId);
          const requestedQuantity = (existingItem?.quantity ?? 0) + quantityToAdd;
          const nextQuantity = capQuantity(requestedQuantity, snapshot.inventory);

          if (nextQuantity <= 0) {
            return { items: state.items.filter((cartItem) => cartItem.productId !== snapshot.productId) };
          }

          if (existingItem) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === snapshot.productId
                  ? {
                      ...cartItem,
                      ...snapshot,
                      quantity: nextQuantity,
                    }
                  : cartItem,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...snapshot,
                quantity: nextQuantity,
              },
            ],
          };
        });
      },

      updateQuantity(productId, quantity) {
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId) {
              return [item];
            }

            const nextQuantity = capQuantity(quantity, item.inventory);
            return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
          }),
        }));
      },

      incrementItem(productId, amount = 1) {
        const item = get().items.find((cartItem) => cartItem.productId === productId);
        const quantityToAdd = normalizePositiveQuantity(amount);

        if (item && quantityToAdd > 0) {
          get().updateQuantity(productId, item.quantity + quantityToAdd);
        }
      },

      decrementItem(productId, amount = 1) {
        const item = get().items.find((cartItem) => cartItem.productId === productId);
        const quantityToRemove = normalizePositiveQuantity(amount);

        if (item && quantityToRemove > 0) {
          get().updateQuantity(productId, item.quantity - quantityToRemove);
        }
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      getItemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal() {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getLineTotal(productId) {
        const item = get().items.find((cartItem) => cartItem.productId === productId);
        return item ? item.price * item.quantity : 0;
      },
    }),
    {
      name: "hiraya-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartItems = (state: CartState) => state.items;
export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const selectCartLineTotal = (productId: string) => (state: CartState) => {
  const item = state.items.find((cartItem) => cartItem.productId === productId);
  return item ? item.price * item.quantity : 0;
};

export type { CartState };
