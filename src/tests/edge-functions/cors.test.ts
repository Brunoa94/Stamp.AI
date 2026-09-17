// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  buildCorsHeaders,
  parseAllowedOrigins,
} from "../../../supabase/functions/_shared/cors";

/**
 * Every edge function used to answer `Access-Control-Allow-Origin: *`. The
 * shared helper must instead reflect the request Origin only when it is in
 * the ALLOWED_ORIGINS allow-list, and never fall back to a wildcard.
 */

describe("parseAllowedOrigins", () => {
  it("splits a comma-separated list and trims whitespace", () => {
    expect(
      parseAllowedOrigins(" https://stamp.ai, https://www.stamp.ai ,"),
    ).toEqual(["https://stamp.ai", "https://www.stamp.ai"]);
  });

  it("normalises trailing slashes and letter case of the scheme/host", () => {
    expect(parseAllowedOrigins("HTTPS://Stamp.AI/")).toEqual([
      "https://stamp.ai",
    ]);
  });

  it("drops entries that are not absolute http(s) origins", () => {
    expect(
      parseAllowedOrigins("stamp.ai,*,javascript:alert(1),https://ok.example"),
    ).toEqual(["https://ok.example"]);
  });

  it("falls back to local development origins when the list is empty", () => {
    expect(parseAllowedOrigins(undefined)).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
    expect(parseAllowedOrigins("")).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });
});

describe("buildCorsHeaders", () => {
  const allowed = "https://stamp.ai,https://www.stamp.ai";

  it("reflects an allowed origin and varies on Origin", () => {
    const headers = buildCorsHeaders("https://www.stamp.ai", allowed);

    expect(headers["Access-Control-Allow-Origin"]).toBe(
      "https://www.stamp.ai",
    );
    expect(headers["Vary"]).toBe("Origin");
    expect(headers["Access-Control-Allow-Headers"]).toBe(
      "authorization, x-client-info, apikey, content-type",
    );
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
  });

  it("matches origins case-insensitively and ignores a trailing slash", () => {
    const headers = buildCorsHeaders("https://STAMP.ai/", allowed);

    expect(headers["Access-Control-Allow-Origin"]).toBe("https://STAMP.ai/");
  });

  it("omits Access-Control-Allow-Origin for an origin outside the list", () => {
    const headers = buildCorsHeaders("https://evil.example", allowed);

    expect(headers).not.toHaveProperty("Access-Control-Allow-Origin");
    expect(headers["Vary"]).toBe("Origin");
  });

  it("omits Access-Control-Allow-Origin when the request has no Origin", () => {
    const headers = buildCorsHeaders(null, allowed);

    expect(headers).not.toHaveProperty("Access-Control-Allow-Origin");
  });

  it("never emits a wildcard, even when ALLOWED_ORIGINS is '*'", () => {
    const headers = buildCorsHeaders("https://evil.example", "*");

    expect(headers).not.toHaveProperty("Access-Control-Allow-Origin");
  });

  it("allows local development origins when ALLOWED_ORIGINS is unset", () => {
    const headers = buildCorsHeaders("http://localhost:3000", undefined);

    expect(headers["Access-Control-Allow-Origin"]).toBe(
      "http://localhost:3000",
    );
  });

  it("appends provider-specific request headers and custom methods", () => {
    const headers = buildCorsHeaders("https://stamp.ai", allowed, {
      extraAllowedHeaders: ["stripe-signature"],
      methods: "POST, GET, OPTIONS",
    });

    expect(headers["Access-Control-Allow-Headers"]).toBe(
      "authorization, x-client-info, apikey, content-type, stripe-signature",
    );
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
  });
});
