import { afterEach, describe, expect, it, vi } from "vitest";
import { registerErrorReporter, reportError } from "../../../supabase/functions/_shared/errorReporting";
import { FunctionError, handleError } from "../../../supabase/functions/_shared/errors";

afterEach(() => registerErrorReporter(null));

describe("edge error reporting", () => {
  it("is a no-op until a reporter is registered", () => {
    expect(() => reportError(new Error("x"))).not.toThrow();
  });

  it("reports server errors from handleError but not client errors", async () => {
    const reporter = vi.fn();
    registerErrorReporter(reporter);

    const clientError = handleError(new FunctionError(409, "ITEMS_NOT_PAID", "no"), {});
    expect(clientError.status).toBe(409);
    expect(reporter).not.toHaveBeenCalled();

    const crash = new Error("db down");
    const serverError = handleError(crash, {});
    expect(serverError.status).toBe(500);
    expect(await serverError.json()).toEqual({ error: "INTERNAL_ERROR" });
    expect(reporter).toHaveBeenCalledWith(crash, undefined);

    handleError(new FunctionError(502, "PRINTIFY_ORDER_API_ERROR", "down"), {});
    expect(reporter).toHaveBeenLastCalledWith(expect.any(FunctionError), { errorId: "PRINTIFY_ORDER_API_ERROR" });
  });

  it("never lets a failing reporter break the response", () => {
    registerErrorReporter(() => {
      throw new Error("sentry down");
    });
    expect(handleError(new Error("x"), {}).status).toBe(500);
  });
});
