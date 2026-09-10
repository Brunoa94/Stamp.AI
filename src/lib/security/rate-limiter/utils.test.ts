import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getClientIdentifier } from "./utils";

/**
 * Creates a mock NextRequest with specified headers
 */
function createMockRequest(
  headers: Record<string, string> = {}
): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as NextRequest;
}

describe("getClientIdentifier", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.TRUST_CF_HEADERS;
    delete process.env.VERCEL;
    delete process.env.TRUST_PROXY_HEADERS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("when no proxy trust is configured", () => {
    it("returns 'unknown' even when x-forwarded-for is present", () => {
      const request = createMockRequest({
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });

    it("returns 'unknown' even when x-real-ip is present", () => {
      const request = createMockRequest({
        "x-real-ip": "1.2.3.4",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });

    it("returns 'unknown' even when cf-connecting-ip is present", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "1.2.3.4",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });

    it("returns 'unknown' for empty headers", () => {
      const request = createMockRequest({});
      expect(getClientIdentifier(request)).toBe("unknown");
    });
  });

  describe("when TRUST_CF_HEADERS is enabled", () => {
    beforeEach(() => {
      process.env.TRUST_CF_HEADERS = "true";
    });

    it("uses cf-connecting-ip when valid", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "203.0.113.50",
      });
      expect(getClientIdentifier(request)).toBe("203.0.113.50");
    });

    it("trims whitespace from cf-connecting-ip", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "  203.0.113.50  ",
      });
      expect(getClientIdentifier(request)).toBe("203.0.113.50");
    });

    it("rejects invalid cf-connecting-ip and falls back to unknown", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "not-an-ip",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });

    it("rejects empty cf-connecting-ip", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });
  });

  describe("when VERCEL=1 (proxy headers trusted)", () => {
    beforeEach(() => {
      process.env.VERCEL = "1";
    });

    it("prefers x-real-ip over x-forwarded-for", () => {
      const request = createMockRequest({
        "x-real-ip": "10.0.0.1",
        "x-forwarded-for": "192.168.1.1, 10.0.0.2",
      });
      expect(getClientIdentifier(request)).toBe("10.0.0.1");
    });

    it("uses first entry of x-forwarded-for when x-real-ip is absent", () => {
      const request = createMockRequest({
        "x-forwarded-for": "192.168.1.100, 10.0.0.2, 172.16.0.1",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.100");
    });

    it("trims whitespace from x-forwarded-for entries", () => {
      const request = createMockRequest({
        "x-forwarded-for": "  192.168.1.100  , 10.0.0.2",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.100");
    });

    it("rejects invalid x-real-ip and falls back to x-forwarded-for", () => {
      const request = createMockRequest({
        "x-real-ip": "garbage",
        "x-forwarded-for": "172.16.0.50",
      });
      expect(getClientIdentifier(request)).toBe("172.16.0.50");
    });

    it("rejects invalid x-forwarded-for and returns unknown", () => {
      const request = createMockRequest({
        "x-forwarded-for": "not-valid-ip",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });

    it("returns unknown when all headers are invalid", () => {
      const request = createMockRequest({
        "x-real-ip": "::::",
        "x-forwarded-for": "abc.def.ghi.jkl",
      });
      expect(getClientIdentifier(request)).toBe("unknown");
    });
  });

  describe("when TRUST_PROXY_HEADERS=true", () => {
    beforeEach(() => {
      process.env.TRUST_PROXY_HEADERS = "true";
    });

    it("trusts x-real-ip", () => {
      const request = createMockRequest({
        "x-real-ip": "8.8.8.8",
      });
      expect(getClientIdentifier(request)).toBe("8.8.8.8");
    });

    it("trusts x-forwarded-for", () => {
      const request = createMockRequest({
        "x-forwarded-for": "1.1.1.1",
      });
      expect(getClientIdentifier(request)).toBe("1.1.1.1");
    });
  });

  describe("header precedence", () => {
    it("cf-connecting-ip takes precedence over proxy headers when both are trusted", () => {
      process.env.TRUST_CF_HEADERS = "true";
      process.env.VERCEL = "1";
      const request = createMockRequest({
        "cf-connecting-ip": "1.2.3.4",
        "x-real-ip": "5.6.7.8",
        "x-forwarded-for": "9.10.11.12",
      });
      expect(getClientIdentifier(request)).toBe("1.2.3.4");
    });

    it("falls through to proxy headers when cf-connecting-ip is invalid", () => {
      process.env.TRUST_CF_HEADERS = "true";
      process.env.VERCEL = "1";
      const request = createMockRequest({
        "cf-connecting-ip": "invalid",
        "x-real-ip": "5.6.7.8",
      });
      expect(getClientIdentifier(request)).toBe("5.6.7.8");
    });
  });

  describe("IP validation", () => {
    beforeEach(() => {
      process.env.VERCEL = "1";
    });

    describe("valid IPv4 addresses", () => {
      const validIpv4 = [
        "0.0.0.0",
        "127.0.0.1",
        "192.168.1.1",
        "255.255.255.255",
        "10.0.0.1",
        "172.16.0.1",
      ];

      validIpv4.forEach((ip) => {
        it(`accepts ${ip}`, () => {
          const request = createMockRequest({ "x-real-ip": ip });
          expect(getClientIdentifier(request)).toBe(ip);
        });
      });
    });

    describe("invalid IPv4 addresses", () => {
      const invalidIpv4 = [
        "256.1.1.1",
        "1.256.1.1",
        "1.1.256.1",
        "1.1.1.256",
        "1.1.1",
        "1.1.1.1.1",
        "1.1.1.1.",
        ".1.1.1.1",
        "abc.def.ghi.jkl",
        "1.1.1.1a",
        "01onal.1.1.1",
      ];

      invalidIpv4.forEach((ip) => {
        it(`rejects ${ip}`, () => {
          const request = createMockRequest({ "x-real-ip": ip });
          expect(getClientIdentifier(request)).toBe("unknown");
        });
      });
    });

    describe("valid IPv6 addresses", () => {
      const validIpv6 = [
        "::1",
        "::ffff:127.0.0.1",
        "2001:db8::1",
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "fe80::1",
        "::",
      ];

      validIpv6.forEach((ip) => {
        it(`accepts ${ip}`, () => {
          const request = createMockRequest({ "x-real-ip": ip });
          expect(getClientIdentifier(request)).toBe(ip);
        });
      });
    });

    describe("invalid IPv6 addresses", () => {
      const invalidIpv6 = [
        ":::",
        "::::",
        "12345::1",
        "gggg::1",
        "2001:db8::1::2",
        ":",
        "2001:db8:85a3:0000:0000:8a2e:0370:7334:extra",
      ];

      invalidIpv6.forEach((ip) => {
        it(`rejects ${ip}`, () => {
          const request = createMockRequest({ "x-real-ip": ip });
          expect(getClientIdentifier(request)).toBe("unknown");
        });
      });
    });

    describe("injection attempts", () => {
      const injectionAttempts = [
        "1.2.3.4; DROP TABLE users",
        "1.2.3.4\nX-Injected: header",
        "<script>alert(1)</script>",
        "1.2.3.4%00",
        "../../../etc/passwd",
        "1.2.3.4, 5.6.7.8", // x-real-ip should be single value
      ];

      injectionAttempts.forEach((attempt) => {
        it(`rejects injection attempt: ${attempt.substring(0, 30)}...`, () => {
          const request = createMockRequest({ "x-real-ip": attempt });
          expect(getClientIdentifier(request)).toBe("unknown");
        });
      });
    });
  });
});
