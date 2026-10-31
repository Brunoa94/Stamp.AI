// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: mocks.getUser } }),
}));

import { middleware } from "./middleware";

function visit(pathname: string) {
  return middleware(new NextRequest(`https://stamp.ai${pathname}`));
}

function signedInAs(user: { id: string; is_anonymous?: boolean } | null) {
  mocks.getUser.mockResolvedValue({ data: { user } });
}

function isLoginRedirect(response: Response, from: string): boolean {
  const location = response.headers.get("location");
  if (!location) return false;
  const url = new URL(location);
  return url.pathname === "/" && url.searchParams.get("redirectedFrom") === from;
}

describe("middleware route protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["/stamp", "/cart", "/checkout", "/checkout/success"])(
    "lets a visitor with no session through to %s",
    async (pathname) => {
      signedInAs(null);

      const response = await visit(pathname);

      expect(response.headers.get("location")).toBeNull();
    },
  );

  it.each(["/orders", "/profile", "/dashboard"])(
    "redirects a visitor with no session away from %s",
    async (pathname) => {
      signedInAs(null);

      const response = await visit(pathname);

      expect(isLoginRedirect(response, pathname)).toBe(true);
    },
  );

  it.each(["/orders", "/profile", "/dashboard"])(
    "redirects a guest with an anonymous session away from %s",
    async (pathname) => {
      signedInAs({ id: "anon-1", is_anonymous: true });

      const response = await visit(pathname);

      expect(isLoginRedirect(response, pathname)).toBe(true);
    },
  );

  it("lets a registered user through to /orders", async () => {
    signedInAs({ id: "user-1", is_anonymous: false });

    const response = await visit("/orders");

    expect(response.headers.get("location")).toBeNull();
  });
});
