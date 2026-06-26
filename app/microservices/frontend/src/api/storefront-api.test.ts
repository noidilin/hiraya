import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, setAccessToken } from "./client";
import { getProduct, listCategories, listProducts } from "./products";

const productWire = {
  id: "haori-indigo-001",
  name: "Indigo Sashiko Haori",
  description: "A repaired cotton haori with dense sashiko texture.",
  price: "188.00",
  compare_price: "228.00",
  brand: "Hiraya Furugi",
  inventory_quantity: 3,
  is_featured: true,
  created_at: "2026-01-02T00:00:00.000Z",
  updated_at: "2026-01-03T00:00:00.000Z",
  category: "Outerwear",
  image_url: "/product-images/indigo-sashiko-haori.jpg",
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("Storefront API adapters", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    const localStorage = {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    };

    vi.stubGlobal("window", { localStorage });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("unwraps product envelopes and normalizes Storefront product wire data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          products: [productWire],
          pagination: { currentPage: 1, totalPages: 1, total: 1, hasNext: false, hasPrev: false },
        },
      }),
    );

    const productList = await listProducts({ limit: 100 });

    expect(fetch).toHaveBeenCalledWith("/api/products?limit=100", expect.any(Object));
    expect(productList.products).toEqual([
      expect.objectContaining({
        id: "haori-indigo-001",
        price: 188,
        originalPrice: 228,
        imageUrl: "/product-images/indigo-sashiko-haori.jpg",
        inventory: 3,
        isNew: true,
      }),
    ]);
  });

  it("loads category filter options from the categories endpoint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [
          {
            id: "outerwear",
            name: "Outerwear",
            description: null,
            image_url: null,
            product_count: "7",
          },
        ],
      }),
    );

    await expect(listCategories()).resolves.toEqual([
      { id: "outerwear", name: "Outerwear", productCount: 7 },
    ]);
    expect(fetch).toHaveBeenCalledWith("/api/products/categories", expect.any(Object));
  });

  it("injects the bearer token through the centralized API client", async () => {
    setAccessToken("storefront-token");
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: true, data: productWire }));

    await getProduct("haori-indigo-001");

    const [, requestInit] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect((requestInit?.headers as Headers).get("Authorization")).toBe("Bearer storefront-token");
  });

  it("clears the centralized bearer token", () => {
    setAccessToken("storefront-token");

    clearAccessToken();

    expect(window.localStorage.getItem("accessToken")).toBeNull();
  });

  it("rejects failed Storefront envelopes instead of returning data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ success: false, error: "Products unavailable" }, { status: 503 }));

    await expect(listProducts()).rejects.toThrow("Products unavailable");
  });
});
