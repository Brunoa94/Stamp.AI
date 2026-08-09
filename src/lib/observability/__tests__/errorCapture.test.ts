import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import {
  captureError,
  captureMessage,
  setUser,
  getUser,
  setRequestId,
  getRequestId,
  addBreadcrumb,
  setTag,
  createServiceCapture,
} from "../errorCapture";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  withScope: vi.fn((callback) => callback({
    setTag: vi.fn(),
    setLevel: vi.fn(),
    setContext: vi.fn(),
    setUser: vi.fn(),
  })),
  captureException: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  setTag: vi.fn(),
}));

describe("errorCapture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global state
    setUser(null);
    setRequestId(null);
    // Ensure capture is enabled for tests
    vi.stubEnv("NEXT_PUBLIC_ERROR_CAPTURE_ENABLED", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("captureError", () => {
    it("should return a unique error ID", () => {
      const errorId = captureError(new Error("Test error"));
      expect(errorId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("should generate different IDs for each error", () => {
      const id1 = captureError(new Error("Error 1"));
      const id2 = captureError(new Error("Error 2"));
      expect(id1).not.toBe(id2);
    });

    it("should handle string errors", () => {
      const errorId = captureError("String error message");
      expect(errorId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("should handle object errors", () => {
      const errorId = captureError({ code: "ERR_001", message: "Object error" });
      expect(errorId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe("captureMessage", () => {
    it("should return a message ID", () => {
      const messageId = captureMessage("Test message");
      expect(messageId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("should accept context and severity", () => {
      const messageId = captureMessage(
        "Info message",
        { service: "TestService", action: "testAction" },
        "info"
      );
      expect(messageId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });
  });

  describe("setUser / getUser", () => {
    it("should set and get user context", () => {
      const user = { id: "user-123", email: "test@example.com", name: "Test User" };
      setUser(user);
      expect(getUser()).toEqual(user);
    });

    it("should clear user context when set to null", () => {
      setUser({ id: "user-123" });
      setUser(null);
      expect(getUser()).toBeNull();
    });

    it("should call Sentry.setUser when setting user", () => {
      const user = { id: "user-123", email: "test@example.com" };
      setUser(user);
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: "user-123",
        email: "test@example.com",
        username: undefined,
      });
    });

    it("should call Sentry.setUser(null) when clearing user", () => {
      setUser(null);
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe("setRequestId / getRequestId", () => {
    it("should set and get request ID", () => {
      setRequestId("req_test_123");
      expect(getRequestId()).toBe("req_test_123");
    });

    it("should clear request ID when set to null", () => {
      setRequestId("req_test_123");
      setRequestId(null);
      expect(getRequestId()).toBeNull();
    });
  });

  describe("addBreadcrumb", () => {
    it("should call Sentry.addBreadcrumb with correct params", () => {
      addBreadcrumb("User clicked button", "ui", { buttonId: "submit" });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: "User clicked button",
        category: "ui",
        data: { buttonId: "submit" },
        level: "info",
      });
    });

    it("should work without data parameter", () => {
      addBreadcrumb("Navigation event", "navigation");
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: "Navigation event",
        category: "navigation",
        data: undefined,
        level: "info",
      });
    });
  });

  describe("setTag", () => {
    it("should call Sentry.setTag with key and value", () => {
      setTag("environment", "test");
      expect(Sentry.setTag).toHaveBeenCalledWith("environment", "test");
    });
  });

  describe("createServiceCapture", () => {
    it("should create a capture object with service context", () => {
      const paymentCapture = createServiceCapture("PaymentService");
      expect(paymentCapture).toHaveProperty("error");
      expect(paymentCapture).toHaveProperty("warning");
      expect(paymentCapture).toHaveProperty("message");
      expect(paymentCapture).toHaveProperty("breadcrumb");
    });

    it("error method should return an error ID", () => {
      const capture = createServiceCapture("TestService");
      const errorId = capture.error(new Error("Test"));
      expect(errorId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("warning method should return an error ID", () => {
      const capture = createServiceCapture("TestService");
      const errorId = capture.warning(new Error("Warning"));
      expect(errorId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("message method should return a message ID", () => {
      const capture = createServiceCapture("TestService");
      const messageId = capture.message("Info message");
      expect(messageId).toMatch(/^err_[a-z0-9]+_[a-z0-9]+$/);
    });

    it("breadcrumb method should call addBreadcrumb with service prefix", () => {
      const capture = createServiceCapture("PaymentService");
      capture.breadcrumb("Processing payment", "action", { amount: 99.99 });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: "[PaymentService] Processing payment",
        category: "action",
        data: { amount: 99.99 },
        level: "info",
      });
    });
  });
});
