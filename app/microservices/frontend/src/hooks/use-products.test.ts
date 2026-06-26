import { describe, expect, it } from "vitest";

import { PLACEHOLDER_PRODUCT_IMAGE, type Product } from "@/api";
import { withCatalogPresentation } from "./use-products";

const catalogMatchedProduct: Product = {
  id: "67be2d5e-ecfb-4bf9-b751-8474f9d7bcac",
  name: "Prairie Midi Dress",
  description: "",
  price: 128,
  imageUrl: PLACEHOLDER_PRODUCT_IMAGE,
  category: "Dresses",
  brand: "Hiraya Furugi",
  inventory: 4,
  isNew: true,
  createdAt: "2026-06-23T00:00:00.000Z",
  updatedAt: "2026-06-23T00:00:00.000Z",
};

describe("withCatalogPresentation", () => {
  it("keeps backend imageUrl authoritative even when it is the placeholder", () => {
    const presented = withCatalogPresentation(catalogMatchedProduct);

    expect(presented.imageUrl).toBe(PLACEHOLDER_PRODUCT_IMAGE);
  });

  it("still enriches sparse editorial presentation fields from the static catalog", () => {
    const presented = withCatalogPresentation(catalogMatchedProduct);

    expect(presented.description).not.toBe("");
    expect(presented.name).toBe(catalogMatchedProduct.name);
    expect(presented.id).toBe(catalogMatchedProduct.id);
  });
});
