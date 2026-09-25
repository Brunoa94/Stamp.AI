import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only these hosts may be proxied. This endpoint exists to fetch product/design
// images from known image CDNs — never arbitrary URLs. Keep in sync with
// next.config.ts remotePatterns.
const PRINTIFY_S3_HOST = "pfy-prod-image-storage.s3.us-east-2.amazonaws.com";
const ALLOWED_HOSTS = new Set([
  "images.printify.com",
  "images-api.printify.com",
  PRINTIFY_S3_HOST,
  "oaidalleapiprodscus.blob.core.windows.net",
  "placehold.co",
]);
// Fallback only when NEXT_PUBLIC_SUPABASE_URL is not configured; otherwise the
// project's own Supabase host is matched exactly.
const SUPABASE_HOST_SUFFIX = ".supabase.co";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB cap
const FETCH_TIMEOUT_MS = 15_000;

function getOwnSupabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isAllowedImageUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  // Reject IP literals and internal hostnames — prevents SSRF to loopback /
  // link-local / cloud-metadata endpoints.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return false;
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return false;
  }
  if (ALLOWED_HOSTS.has(host)) return true;

  const ownSupabaseHost = getOwnSupabaseHost();
  if (ownSupabaseHost) return host === ownSupabaseHost;
  return host.endsWith(SUPABASE_HOST_SUFFIX);
}

function isAllowedContentType(contentType: string): boolean {
  const mediaType = contentType.split(";")[0].trim().toLowerCase();
  if (!mediaType.startsWith("image/")) return false;
  // SVG can carry scripts; this proxy is for raster product images only.
  return mediaType !== "image/svg+xml";
}

/**
 * Read the body incrementally and abort as soon as it exceeds MAX_BYTES, so a
 * misbehaving upstream cannot make us buffer an unbounded response.
 * Returns null when the limit is exceeded.
 */
async function readBodyWithLimit(
  body: ReadableStream<Uint8Array>,
  limit: number,
): Promise<Uint8Array | null> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

export async function GET(request: NextRequest) {
  // Require an authenticated user — this is not a public open proxy.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const remoteUrl = request.nextUrl.searchParams.get("url");
  if (!remoteUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedImageUrl(remoteUrl)) {
    return NextResponse.json({ error: "URL host not allowed" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(remoteUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      redirect: "error", // do not follow redirects into disallowed hosts
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!isAllowedContentType(contentType)) {
      return NextResponse.json(
        { error: "Remote resource is not a supported image" },
        { status: 400 },
      );
    }

    // Reject on the declared size before touching the body at all.
    const declaredLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
      controller.abort();
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "Remote resource has no body" },
        { status: 502 },
      );
    }

    const bytes = await readBodyWithLimit(response.body, MAX_BYTES);
    if (bytes === null) {
      controller.abort();
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(new Blob([bytes as BlobPart]), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Timed out fetching remote image" },
        { status: 504 },
      );
    }
    return NextResponse.json({ error: "Failed to fetch remote image" }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
