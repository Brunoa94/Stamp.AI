import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger, logger, loggers, log } from "../logger";

// Mock errorCapture module
vi.mock("../errorCapture", () => ({
  getRequestId: vi.fn(() => null),
  getUser: vi.fn(() => null),
}));

describe("logger", () => {
  const consoleSpy = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("createLogger", () => {
    it("should create a logger with the specified service", () => {
      const testLogger = createLogger({ service: "TestService" });
      expect(testLogger).toHaveProperty("debug");
      expect(testLogger).toHaveProperty("info");
      expect(testLogger).toHaveProperty("warn");
      expect(testLogger).toHaveProperty("error");
      expect(testLogger).toHaveProperty("child");
    });

    it("should include service in log entries", () => {
      const testLogger = createLogger({ service: "TestService" });
      const entry = testLogger.info("Test message");
      expect(entry.service).toBe("TestService");
    });

    it("should include timestamp in ISO format", () => {
      const testLogger = createLogger({ service: "TestService" });
      const entry = testLogger.info("Test message");
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should include log level", () => {
      const testLogger = createLogger({ service: "TestService" });
      expect(testLogger.debug("Debug").level).toBe("debug");
      expect(testLogger.info("Info").level).toBe("info");
      expect(testLogger.warn("Warn").level).toBe("warn");
      expect(testLogger.error("Error").level).toBe("error");
    });
  });

  describe("log levels", () => {
    it("info should log the message", () => {
      const testLogger = createLogger({ service: "Test" });
      testLogger.info("Info message");
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it("warn should log with console.warn", () => {
      const testLogger = createLogger({ service: "Test" });
      testLogger.warn("Warning message");
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it("error should log with console.error", () => {
      const testLogger = createLogger({ service: "Test" });
      testLogger.error("Error message");
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe("log options", () => {
    it("should include action in log entry", () => {
      const testLogger = createLogger({ service: "Test" });
      const entry = testLogger.info("Message", { action: "testAction" });
      expect(entry.action).toBe("testAction");
    });

    it("should include metadata in log entry", () => {
      const testLogger = createLogger({ service: "Test" });
      const entry = testLogger.info("Message", {
        metadata: { orderId: "123", amount: 99.99 },
      });
      expect(entry.metadata).toEqual({ orderId: "123", amount: 99.99 });
    });

    it("should serialize Error objects", () => {
      const testLogger = createLogger({ service: "Test" });
      const error = new Error("Test error");
      const entry = testLogger.error("Error occurred", { error });
      expect(entry.error).toEqual({
        name: "Error",
        message: "Test error",
        stack: expect.any(String),
        code: undefined,
      });
    });

    it("should serialize string errors", () => {
      const testLogger = createLogger({ service: "Test" });
      const entry = testLogger.error("Error occurred", { error: "String error" });
      expect(entry.error).toEqual({
        name: "Error",
        message: "String error",
      });
    });

    it("should handle circular reference in error objects", () => {
      const testLogger = createLogger({ service: "Test" });
      const circular: Record<string, unknown> = { name: "circular" };
      circular.self = circular;
      const entry = testLogger.error("Error occurred", { error: circular });
      expect(entry.error).toEqual({
        name: "UnknownError",
        message: expect.any(String),
      });
    });
  });

  describe("child logger", () => {
    it("should create a child logger with inherited service", () => {
      const parentLogger = createLogger({ service: "Parent" });
      const childLogger = parentLogger.child({});
      const entry = childLogger.info("Child message");
      expect(entry.service).toBe("Parent");
    });

    it("should allow overriding service in child logger", () => {
      const parentLogger = createLogger({ service: "Parent" });
      const childLogger = parentLogger.child({ service: "Child" });
      const entry = childLogger.info("Child message");
      expect(entry.service).toBe("Child");
    });

    it("should merge default metadata from parent", () => {
      const parentLogger = createLogger({
        service: "Parent",
        defaultMetadata: { parentKey: "parentValue" },
      });
      const childLogger = parentLogger.child({
        defaultMetadata: { childKey: "childValue" },
      });
      const entry = childLogger.info("Message");
      expect(entry.metadata).toEqual({
        parentKey: "parentValue",
        childKey: "childValue",
      });
    });
  });

  describe("default loggers", () => {
    it("logger should be the default app logger", () => {
      const entry = logger.info("Test");
      expect(entry.service).toBe("app");
    });

    it("loggers.auth should have auth service", () => {
      const entry = loggers.auth.info("Test");
      expect(entry.service).toBe("auth");
    });

    it("loggers.payment should have payment service", () => {
      const entry = loggers.payment.info("Test");
      expect(entry.service).toBe("payment");
    });

    it("loggers.order should have order service", () => {
      const entry = loggers.order.info("Test");
      expect(entry.service).toBe("order");
    });
  });

  describe("quick log functions", () => {
    it("log.info should use default logger", () => {
      const entry = log.info("Quick log");
      expect(entry.service).toBe("app");
      expect(entry.level).toBe("info");
    });

    it("log.error should use default logger", () => {
      const entry = log.error("Quick error");
      expect(entry.service).toBe("app");
      expect(entry.level).toBe("error");
    });
  });

  describe("min log level", () => {
    it("should respect minimum log level", () => {
      const testLogger = createLogger({ service: "Test", minLevel: "warn" });
      testLogger.debug("Debug message");
      testLogger.info("Info message");
      expect(consoleSpy.log).not.toHaveBeenCalled();
      testLogger.warn("Warn message");
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });
});
