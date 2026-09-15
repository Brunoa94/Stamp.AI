import { describe, expect, it, vi } from "vitest";
import { isTransientError, withRetry } from "./withRetry";

const noSleep = async (): Promise<void> => {};

function httpError(status: number): Error & { status: number } {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

describe("isTransientError", () => {
  it("treats 429 and 5xx status codes as transient", () => {
    expect(isTransientError(httpError(429))).toBe(true);
    expect(isTransientError(httpError(500))).toBe(true);
    expect(isTransientError(httpError(503))).toBe(true);
  });

  it("reads statusCode and response.status shapes", () => {
    expect(isTransientError({ statusCode: 502 })).toBe(true);
    expect(isTransientError({ response: { status: 504 } })).toBe(true);
  });

  it("rejects 4xx client errors other than 429", () => {
    expect(isTransientError(httpError(400))).toBe(false);
    expect(isTransientError(httpError(401))).toBe(false);
    expect(isTransientError(httpError(404))).toBe(false);
  });

  it("treats network failures and aborts as transient", () => {
    expect(isTransientError(new TypeError("fetch failed"))).toBe(true);
    expect(isTransientError(Object.assign(new Error("reset"), { code: "ECONNRESET" }))).toBe(true);
    expect(isTransientError(new DOMException("aborted", "AbortError"))).toBe(true);
    expect(isTransientError(new DOMException("timed out", "TimeoutError"))).toBe(true);
  });

  it("does not treat generic errors as transient", () => {
    expect(isTransientError(new Error("moderation_blocked"))).toBe(false);
    expect(isTransientError("string")).toBe(false);
  });
});

describe("withRetry", () => {
  it("returns the first successful result without retrying", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    await expect(withRetry(fn, { sleep: noSleep })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries transient errors and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(httpError(503))
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValue("ok");

    await expect(withRetry(fn, { retries: 2, sleep: noSleep })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry non-transient errors", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(400));

    await expect(withRetry(fn, { retries: 3, sleep: noSleep })).rejects.toThrow("HTTP 400");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after the configured number of retries", async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500));

    await expect(withRetry(fn, { retries: 2, sleep: noSleep })).rejects.toThrow("HTTP 500");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("backs off exponentially with a cap", async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockRejectedValue(httpError(500));

    await withRetry(fn, {
      retries: 3,
      baseDelayMs: 100,
      maxDelayMs: 250,
      jitter: false,
      sleep,
    }).catch(() => undefined);

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([100, 200, 250]);
  });

  it("stops retrying once the caller's signal is aborted", async () => {
    const controller = new AbortController();
    const fn = vi.fn().mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException("aborted", "AbortError"));
    });

    await expect(
      withRetry(fn, { retries: 3, signal: controller.signal, sleep: noSleep }),
    ).rejects.toThrow("aborted");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes the attempt number to the operation", async () => {
    const fn = vi.fn().mockRejectedValueOnce(httpError(500)).mockResolvedValue("ok");

    await withRetry(fn, { retries: 1, sleep: noSleep });

    expect(fn).toHaveBeenNthCalledWith(1, 0);
    expect(fn).toHaveBeenNthCalledWith(2, 1);
  });
});
