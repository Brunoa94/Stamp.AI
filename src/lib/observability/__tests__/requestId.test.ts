import { describe, expect, it } from "vitest";
import {
  REQUEST_ID_HEADER,
  generateRequestId,
  getRequestIdFromHeaders,
  createRequestIdHeaders,
  getRequestIdFromResponse,
} from "../requestId";

describe("requestId", () => {
  describe("REQUEST_ID_HEADER", () => {
    it("should be x-request-id", () => {
      expect(REQUEST_ID_HEADER).toBe("x-request-id");
    });
  });

  describe("generateRequestId", () => {
    it("should generate a unique request ID", () => {
      const id = generateRequestId();
      expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("should generate different IDs on each call", () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });

    it("should start with req_ prefix", () => {
      const id = generateRequestId();
      expect(id.startsWith("req_")).toBe(true);
    });
  });

  describe("getRequestIdFromHeaders", () => {
    it("should return existing request ID from headers", () => {
      const headers = new Headers();
      headers.set(REQUEST_ID_HEADER, "req_existing_123");
      const id = getRequestIdFromHeaders(headers);
      expect(id).toBe("req_existing_123");
    });

    it("should generate new ID if header is not present", () => {
      const headers = new Headers();
      const id = getRequestIdFromHeaders(headers);
      expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("should generate new ID if header is empty string", () => {
      const headers = new Headers();
      headers.set(REQUEST_ID_HEADER, "");
      const id = getRequestIdFromHeaders(headers);
      expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe("createRequestIdHeaders", () => {
    it("should create headers object with request ID", () => {
      const headers = createRequestIdHeaders("req_test_123");
      expect(headers[REQUEST_ID_HEADER]).toBe("req_test_123");
    });

    it("should merge with existing headers", () => {
      const headers = createRequestIdHeaders("req_test_123", {
        "Content-Type": "application/json",
      });
      expect(headers[REQUEST_ID_HEADER]).toBe("req_test_123");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should override existing request ID header", () => {
      const headers = createRequestIdHeaders("req_new_456", {
        [REQUEST_ID_HEADER]: "req_old_123",
      });
      expect(headers[REQUEST_ID_HEADER]).toBe("req_new_456");
    });
  });

  describe("getRequestIdFromResponse", () => {
    it("should extract request ID from response headers", () => {
      const response = new Response(null, {
        headers: { [REQUEST_ID_HEADER]: "req_response_123" },
      });
      const id = getRequestIdFromResponse(response);
      expect(id).toBe("req_response_123");
    });

    it("should return undefined if header is not present", () => {
      const response = new Response(null);
      const id = getRequestIdFromResponse(response);
      expect(id).toBeUndefined();
    });

    it("should return undefined if header is empty", () => {
      const response = new Response(null, {
        headers: { [REQUEST_ID_HEADER]: "" },
      });
      const id = getRequestIdFromResponse(response);
      expect(id).toBeUndefined();
    });
  });
});
