import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSinglePaymentAttempt } from "../useSinglePaymentAttempt";

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useSinglePaymentAttempt", () => {
  it("ignores a second click while the first payment attempt is still running", async () => {
    const { result } = renderHook(() => useSinglePaymentAttempt());
    const first = deferred();
    const startPayment = vi.fn(() => first.promise);

    let firstRun!: Promise<unknown>;
    act(() => {
      firstRun = result.current(startPayment);
      void result.current(startPayment);
    });
    first.resolve();
    await act(() => firstRun);

    expect(startPayment).toHaveBeenCalledTimes(1);
  });

  it("allows a new attempt once the previous one failed", async () => {
    const { result } = renderHook(() => useSinglePaymentAttempt());
    const failing = vi.fn(() => Promise.reject(new Error("declined")));
    const retry = vi.fn(() => Promise.resolve());

    await act(async () => {
      await expect(result.current(failing)).rejects.toThrow("declined");
    });
    await act(() => result.current(retry));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
