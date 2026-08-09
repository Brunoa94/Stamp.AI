import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import {
  createErrorResponse,
  createSuccessResponse,
  ApiErrors,
} from "../apiResponse";

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

  describe("ApiErrors helpers", () => {
    it("badRequest should return 400", async () => {
      const response = await ApiErrors.badRequest("Invalid input");
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe("BAD_REQUEST");
    });

    it("badRequest should include details", async () => {
      const response = await ApiErrors.badRequest("Invalid input", {
        fields: ["name", "email"],
      });
      const body = await response.json();
      expect(body.error.details).toEqual({ fields: ["name", "email"] });
    });

    it("unauthorized should return 401", async () => {
      const response = await ApiErrors.unauthorized();
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("unauthorized should accept custom message", async () => {
      const response = await ApiErrors.unauthorized("Token expired");
      const body = await response.json();
      expect(body.error.message).toBe("Token expired");
    });

    it("forbidden should return 403", async () => {
      const response = await ApiErrors.forbidden();
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("notFound should return 404", async () => {
      const response = await ApiErrors.notFound("User");
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error.message).toBe("User not found");
    });

    it("conflict should return 409", async () => {
      const response = await ApiErrors.conflict("Email already exists");
      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error.code).toBe("CONFLICT");
    });

    it("unprocessable should return 422", async () => {
      const response = await ApiErrors.unprocessable(
        "INSUFFICIENT_FUNDS",
        "Not enough balance"
      );
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.error.code).toBe("INSUFFICIENT_FUNDS");
    });

    it("rateLimited should return 429", async () => {
      const response = await ApiErrors.rateLimited(60);
      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.error.code).toBe("RATE_LIMITED");
      expect(body.error.details?.retryAfter).toBe(60);
    });

    it("internal should return 500", async () => {
      const response = await ApiErrors.internal(new Error("Unexpected"));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe("INTERNAL_ERROR");
    });

    it("externalService should return 502", async () => {
      const response = await ApiErrors.externalService(
        "Stripe",
        new Error("API timeout")
      );
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.error.code).toBe("STRIPE_API_ERROR");
    });

    it("unavailable should return 503", async () => {
      const response = await ApiErrors.unavailable();
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
    });
  });
});
