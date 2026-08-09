import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "../apiResponse";

// Mock dependencies
vi.mock("../requestId.server", () => ({
  getServerRequestId: vi.fn(() => Promise.resolve("req_test_123")),
}));

vi.mock("../errorCapture", () => ({
  captureError: vi.fn(() => "err_test_123"),
}));

vi.mock("../logger", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe("apiResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createErrorResponse", () => {
    it("should return a NextResponse with error body", async () => {
      const response = await createErrorResponse({
        code: "TEST_ERROR",
        message: "Test error message",
        status: 400,
      });

      expect(response).toBeInstanceOf(NextResponse);
      const body = await response.json();
      expect(body.error.code).toBe("TEST_ERROR");
      expect(body.error.message).toBe("Test error message");
    });

    it("should include request ID in response body", async () => {
      const response = await createErrorResponse({
        code: "TEST_ERROR",
        message: "Test error",
        status: 400,
      });

      const body = await response.json();
      expect(body.error.requestId).toBe("req_test_123");
    });

    it("should include request ID in response headers", async () => {
      const response = await createErrorResponse({
        code: "TEST_ERROR",
        message: "Test error",
        status: 400,
      });

      expect(response.headers.get("x-request-id")).toBe("req_test_123");
    });

    it("should set correct status code", async () => {
      const response = await createErrorResponse({
        code: "NOT_FOUND",
        message: "Not found",
        status: 404,
      });

      expect(response.status).toBe(404);
    });

    it("should include details when provided", async () => {
      const response = await createErrorResponse({
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        status: 422,
        details: { field: "email", reason: "invalid format" },
      });

      const body = await response.json();
      expect(body.error.details).toEqual({
        field: "email",
        reason: "invalid format",
      });
    });
  });

  describe("createSuccessResponse", () => {
    it("should return a NextResponse with success body", async () => {
      const response = await createSuccessResponse({
        data: { id: "123", name: "Test" },
      });

      expect(response).toBeInstanceOf(NextResponse);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: "123", name: "Test" });
    });

    it("should include request ID in response body", async () => {
      const response = await createSuccessResponse({
        data: { result: "ok" },
      });

      const body = await response.json();
      expect(body.requestId).toBe("req_test_123");
    });

    it("should default to 200 status", async () => {
      const response = await createSuccessResponse({
        data: {},
      });

      expect(response.status).toBe(200);
    });

    it("should allow custom status code", async () => {
      const response = await createSuccessResponse({
        data: { created: true },
        status: 201,
      });

      expect(response.status).toBe(201);
    });

    it("should include custom headers", async () => {
      const response = await createSuccessResponse({
        data: {},
        headers: { "X-Custom-Header": "custom-value" },
      });

      expect(response.headers.get("X-Custom-Header")).toBe("custom-value");
    });
  });

});
