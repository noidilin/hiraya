import { describe, expect, it } from "vitest";

import { router } from "../../router";

function routePaths(): Set<string> {
  return new Set(Object.keys(router.routesByPath));
}

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
});
