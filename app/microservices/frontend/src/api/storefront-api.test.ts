import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, setAccessToken } from "./client";
import { login } from "./auth";
import { getProduct, listCategories, listProducts } from "./products";
import { createOrder, listMyOrders } from "./orders";

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

  it("creates pending checkout orders through the active orders endpoint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          id: "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
          userId: "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
          totalAmount: "256.00",
          status: "pending",
          paymentStatus: "pending",
          createdAt: "2026-02-14T10:22:31.000Z",
          updatedAt: "2026-02-14T10:22:31.000Z",
          items: [
            {
              id: "b9460644-95f4-47ac-853d-9579ac793f0b",
              orderId: "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
              productId: productWire.id,
              quantity: 2,
              price: productWire.price,
              product: productWire,
            },
          ],
        },
      }),
    );

    const order = await createOrder({
      userId: "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
      items: [{ productId: productWire.id, quantity: 2 }],
      shippingAddress: { street: "123 Demo St", city: "Manila", state: "Metro Manila", zipCode: "1000", country: "PH" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          userId: "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
          items: [{ productId: productWire.id, quantity: 2 }],
          shippingAddress: { street: "123 Demo St", city: "Manila", state: "Metro Manila", zipCode: "1000", country: "PH" },
        }),
      }),
    );
    expect(order).toEqual(expect.objectContaining({ status: "pending", paymentStatus: "pending", totalAmount: 256 }));
  });

  it("loads seeded order history through the active orders endpoint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          orders: [
            {
              id: "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
              userId: "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
              totalAmount: "256.00",
              status: "delivered",
              paymentStatus: "paid",
              createdAt: "2026-02-14T10:22:31.000Z",
              updatedAt: "2026-02-16T15:12:04.000Z",
              items: [
                {
                  id: "b9460644-95f4-47ac-853d-9579ac793f0b",
                  orderId: "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
                  productId: productWire.id,
                  quantity: 2,
                  price: productWire.price,
                  product: productWire,
                },
              ],
            },
          ],
        },
      }),
    );

    const orders = await listMyOrders("f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6");

    expect(fetch).toHaveBeenCalledWith(
      "/api/orders/my-orders?userId=f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
      expect.any(Object),
    );
    expect(orders).toEqual([
      expect.objectContaining({
        id: "8d46347c-43db-4f01-b6c7-d5d3288f0ecb",
        totalAmount: 256,
        paymentStatus: "paid",
        items: [expect.objectContaining({ productId: productWire.id, quantity: 2, price: 188 })],
      }),
    ]);
  });

  it("logs in through the active auth endpoint without calling an unsupported refresh-token flow", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          user: {
            id: "f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6",
            firstName: "Demo",
            lastName: "Customer",
            email: "demo@hirayavintage.test",
            role: "customer",
            createdAt: "2026-02-14T10:22:31.000Z",
            updatedAt: "2026-02-14T10:22:31.000Z",
          },
          token: "storefront-token",
        },
      }),
    );

    await expect(login({ email: "demo@hirayavintage.test", password: "StorefrontDemo123!" })).resolves.toEqual(
      expect.objectContaining({ token: "storefront-token" }),
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "demo@hirayavintage.test", password: "StorefrontDemo123!" }),
      }),
    );
    expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).not.toContain("/api/auth/refresh");
    expect(window.localStorage.getItem("accessToken")).toBe("storefront-token");
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
