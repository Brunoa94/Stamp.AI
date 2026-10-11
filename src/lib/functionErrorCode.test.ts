import { describe, expect, it } from "vitest";
import { readFunctionErrorCode } from "./functionErrorCode";

describe("readFunctionErrorCode", () => {
  it("returns the code from an Edge Function error response", async () => {
    const error = { context: new Response(JSON.stringify({ error: "ALREADY_FULFILLED" }), { status: 409 }) };
    expect(await readFunctionErrorCode(error)).toBe("ALREADY_FULFILLED");
  });

  it("returns null for errors without a JSON response", async () => {
    expect(await readFunctionErrorCode(new Error("network"))).toBeNull();
    expect(await readFunctionErrorCode({ context: new Response("oops", { status: 500 }) })).toBeNull();
    expect(await readFunctionErrorCode(null)).toBeNull();
  });
});
