import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Order } from "@/api";

type LastOrderState = {
  lastOrder: Order | null;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
};

export const useOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      lastOrder: null,
      setLastOrder(order) {
        set({ lastOrder: order });
      },
      clearLastOrder() {
        set({ lastOrder: null });
      },
    }),
    {
      name: "hiraya-last-order",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lastOrder: state.lastOrder }),
    },
  ),
);

export type { LastOrderState };
