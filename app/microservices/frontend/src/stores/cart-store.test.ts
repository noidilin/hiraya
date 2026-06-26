import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore, type AddCartItemInput } from "./cart-store";

const archivePiece: AddCartItemInput = {
  id: "prairie-midi-dress",
  name: "Prairie Midi Dress",
  price: 168,
  imageUrl: "/product-images/prairie-midi-dress.jpg",
  category: "Dresses",
  brand: "Hiraya Furugi",
  inventory: 4,
};

describe("Vintage Storefront cart store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ items: [] });
  });

  it("caps added and updated quantities by product inventory", () => {
    useCartStore.getState().addItem(archivePiece, 3);
    useCartStore.getState().addItem(archivePiece, 3);

    expect(useCartStore.getState().items).toEqual([expect.objectContaining({ productId: archivePiece.id, quantity: 4 })]);

    useCartStore.getState().updateQuantity(archivePiece.id, 99);

    expect(useCartStore.getState().items[0]?.quantity).toBe(4);
  });

  it("persists cart selections in local storage for route changes and auth redirects", () => {
    useCartStore.getState().addItem(archivePiece, 2);

    const persisted = JSON.parse(window.localStorage.getItem("hiraya-cart") ?? "{}");

    expect(persisted.state.items).toEqual([
      expect.objectContaining({
        productId: archivePiece.id,
        name: archivePiece.name,
        quantity: 2,
        inventory: 4,
      }),
    ]);
  });
});
