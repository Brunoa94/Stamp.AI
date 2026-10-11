import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./redirectTarget";

describe("getSafeRedirectPath", () => {
  it("keeps same-origin paths with their query and hash", () => {
    expect(getSafeRedirectPath("/stamp")).toBe("/stamp");
    expect(getSafeRedirectPath("/orders?page=2#top")).toBe("/orders?page=2#top");
  });

  it.each([
    null,
    undefined,
    "",
    "stamp",
    "//evil.example",
    "/\\evil.example",
    "https://evil.example/stamp",
    "javascript:alert(1)",
  ])("rejects %s", (value) => {
    expect(getSafeRedirectPath(value)).toBeNull();
  });
});
