// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
  }),
}));

import { GET } from "./route";

const MAX_BYTES = 15 * 1024 * 1024;
const PRINTIFY_S3 =
  "https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/mockup.png";

function request(url?: string) {
  const target = new URL("https://stamp.ai/api/fetch-remote-image");
  if (url !== undefined) target.searchParams.set("url", url);
  return new NextRequest(target, { method: "GET" });
}

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }
      controller.enqueue(chunks[index++]);
    },
  });
}

function upstream(
  options: {
    status?: number;
    contentType?: string;
    contentLength?: number | null;
    chunks?: Uint8Array[];
  } = {},
) {
  const {
    status = 200,
    contentType = "image/png",
    contentLength = null,
    chunks = [new Uint8Array([1, 2, 3])],
  } = options;
  const headers = new Headers({ "content-type": contentType });
  if (contentLength !== null) headers.set("content-length", String(contentLength));
  return new Response(streamOf(chunks), { status, headers });
}

describe("GET /api/fetch-remote-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mocks.fetch);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://myproject.supabase.co");
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.fetch.mockResolvedValue(upstream());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects unauthenticated callers", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(401);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("requires a url parameter", async () => {
    const response = await GET(request());

    expect(response.status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  describe("host allowlist", () => {
    it.each([
      ["the Printify S3 bucket", PRINTIFY_S3],
      ["images.printify.com", "https://images.printify.com/a.png"],
      ["images-api.printify.com", "https://images-api.printify.com/a.png"],
      ["the project's Supabase host", "https://myproject.supabase.co/storage/v1/object/public/a.png"],
      ["placehold.co", "https://placehold.co/600x400.png"],
    ])("allows %s", async (_label, url) => {
      const response = await GET(request(url));

      expect(response.status).toBe(200);
      expect(mocks.fetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          redirect: "error",
          signal: expect.any(AbortSignal),
        }),
      );
    });

    it.each([
      ["an arbitrary amazonaws bucket", "https://attacker.s3.amazonaws.com/a.png"],
      ["a look-alike amazonaws host", "https://evil.pfy-prod-image-storage.s3.us-east-2.amazonaws.com/a.png"],
      ["another Supabase project when ours is configured", "https://otherproject.supabase.co/a.png"],
      ["plain http", "http://images.printify.com/a.png"],
      ["an IP literal", "https://169.254.169.254/latest/meta-data"],
      ["localhost", "https://localhost/a.png"],
      ["an unknown host", "https://example.com/a.png"],
      ["garbage", "not a url"],
    ])("rejects %s", async (_label, url) => {
      const response = await GET(request(url));

      expect(response.status).toBe(400);
      expect(mocks.fetch).not.toHaveBeenCalled();
    });

    it("falls back to any .supabase.co host when NEXT_PUBLIC_SUPABASE_URL is unset", async () => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

      const response = await GET(request("https://otherproject.supabase.co/a.png"));

      expect(response.status).toBe(200);
    });
  });

  it("streams the upstream bytes back with the image content type", async () => {
    mocks.fetch.mockResolvedValue(
      upstream({
        contentType: "image/jpeg",
        chunks: [new Uint8Array([1, 2]), new Uint8Array([3])],
      }),
    );

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });

  it("passes through upstream error statuses", async () => {
    mocks.fetch.mockResolvedValue(upstream({ status: 404 }));

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(404);
  });

  it("rejects non-image content types", async () => {
    mocks.fetch.mockResolvedValue(upstream({ contentType: "text/html" }));

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(400);
  });

  it("rejects SVG even though it is an image/* type", async () => {
    mocks.fetch.mockResolvedValue(
      upstream({ contentType: "image/svg+xml; charset=utf-8" }),
    );

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(400);
  });

  it("rejects on the declared content-length before reading the body", async () => {
    const pull = vi.fn();
    // highWaterMark 0: pull runs only on an actual read, not to prime the queue.
    const body = new ReadableStream<Uint8Array>({ pull }, { highWaterMark: 0 });
    mocks.fetch.mockResolvedValue(
      new Response(body, {
        status: 200,
        headers: {
          "content-type": "image/png",
          "content-length": String(MAX_BYTES + 1),
        },
      }),
    );

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(413);
    expect(pull).not.toHaveBeenCalled();
  });

  it("aborts a streamed body once it exceeds the byte cap", async () => {
    const chunk = new Uint8Array(1024 * 1024); // 1MB per chunk
    let pulled = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(chunk);
      },
    });
    mocks.fetch.mockResolvedValue(
      new Response(body, {
        status: 200,
        headers: { "content-type": "image/png" },
      }),
    );

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(413);
    // 15 chunks fit, the 16th tips over the limit; a few may be prefetched.
    expect(pulled).toBeLessThan(20);
  });

  it("returns 504 when the upstream fetch is aborted by the timeout", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    mocks.fetch.mockRejectedValue(abortError);

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(504);
  });

  it("returns 500 for other upstream failures", async () => {
    mocks.fetch.mockRejectedValue(new Error("ECONNRESET"));

    const response = await GET(request(PRINTIFY_S3));

    expect(response.status).toBe(500);
  });
});
