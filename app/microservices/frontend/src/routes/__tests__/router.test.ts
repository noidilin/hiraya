import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACCESS_TOKEN_STORAGE_KEY } from "@/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { router } from "../../router";

function routePaths(): Set<string> {
  return new Set(Object.keys(router.routesByPath));
}

beforeEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
  useAuthStore.setState({
    user: null,
    status: "idle",
    error: null,
    hasBootstrapped: false,
  });
});

describe("legacy account route contract", () => {
  it("exposes login, registration, profile, and orders as intentional routes", () => {
    expect([...routePaths()]).toEqual(expect.arrayContaining(["/login", "/register", "/profile", "/orders"]));
  });

  it("keeps copied /auth links as a redirect-only compatibility route", () => {
    const authRoute = router.routesByPath["/auth"];

    expect(authRoute).toBeDefined();
    expect(authRoute.options.component).toBeUndefined();
    expect(authRoute.options.beforeLoad).toEqual(expect.any(Function));
  });

  it("redirects protected routes after a stale stored token fails identity bootstrap", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "bogus-token");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { "content-type": "application/json" } },
    )));

    const profileRoute = router.routesByPath["/profile"];

    await expect(profileRoute.options.beforeLoad?.({
      location: { href: "/profile" },
    } as never)).rejects.toMatchObject({
      options: {
        to: "/login",
        search: { redirect: "/profile" },
      },
    });

    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });
});
