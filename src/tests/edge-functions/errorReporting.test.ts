import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FunctionError,
  handleError,
  setErrorReporter,
} from "../../../supabase/functions/_shared/errors";

/**
 * handleError is the catch-all used by every edge function. It must forward
 * server-side failures (unexpected errors and 5xx FunctionErrors) to the
 * registered reporter (Sentry via _shared/sentry.ts) while leaving client
 * errors (4xx) unreported, and it must keep working with no reporter set.
 */

const cors = { "Access-Control-Allow-Origin": "*" };

describe("handleError reporting hook", () => {
  afterEach(() => {
    setErrorReporter(null);
  });

  it("reports unexpected errors and returns 500 INTERNAL_ERROR", async () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);
    const error = new Error("db down");

    const response = handleError(error, cors);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "INTERNAL_ERROR" });
    expect(reporter).toHaveBeenCalledWith(error);
  });

  it("reports 5xx FunctionErrors but not 4xx ones", () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);

    handleError(new FunctionError(400, "INVALID_REQUEST_BODY", "bad"), cors);
    handleError(new FunctionError(401, "UNAUTHORIZED", "no"), cors);
    expect(reporter).not.toHaveBeenCalled();

    const upstream = new FunctionError(502, "PRINTIFY_API_ERROR", "printify 500");
    handleError(upstream, cors);
    expect(reporter).toHaveBeenCalledWith(upstream);
  });

  it("reports non-Error throwables too", () => {
    const reporter = vi.fn();
    setErrorReporter(reporter);

    const response = handleError("weird", cors);

    expect(response.status).toBe(500);
    expect(reporter).toHaveBeenCalledWith("weird");
  });

  it("never lets a failing reporter break the response", async () => {
    setErrorReporter(() => {
      throw new Error("sentry offline");
    });

    const response = handleError(new Error("x"), cors);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "INTERNAL_ERROR" });
  });

  it("works without a reporter", () => {
    expect(handleError(new Error("x"), cors).status).toBe(500);
  });
});
