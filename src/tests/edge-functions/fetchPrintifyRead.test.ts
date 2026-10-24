// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPrintifyRead } from "../../../supabase/functions/_shared/fetchWithTimeout";

/**
 * Catalog lookups used to treat a rate-limited Printify answer as an empty
 * variant list, failing product creation with NO_VARIANTS_AVAILABLE. Reads
 * now retry 429/5xx answers and hand the caller the final response.
 */

const ENDPOINT = "/v1/catalog/blueprints/1159/print_providers/105/variants.json";

const stubFetch = (...responses: Response[]) => {
  const fetchMock = vi.fn();
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchPrintifyRead", () => {
  it("retries a rate-limited answer and returns the successful one", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = stubFetch(
      new Response("{}", { status: 429 }),
      new Response(JSON.stringify({ variants: [{ id: 91642 }] }), { status: 200 }),
    );

    const response = await fetchPrintifyRead(ENDPOINT, "token", 3, 0);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ variants: [{ id: 91642 }] });
  });

  it("returns the last failure once attempts run out", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = stubFetch(
      new Response("{}", { status: 503 }),
      new Response("{}", { status: 503 }),
      new Response("{}", { status: 503 }),
    );

    const response = await fetchPrintifyRead(ENDPOINT, "token", 3, 0);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(503);
  });

  it("does not retry client errors other than 429", async () => {
    const fetchMock = stubFetch(new Response("{}", { status: 404 }));

    const response = await fetchPrintifyRead(ENDPOINT, "token", 3, 0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
});
