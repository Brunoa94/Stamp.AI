import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only these hosts may be proxied. This endpoint exists to fetch product/design
// images from known image CDNs — never arbitrary URLs. Keep in sync with
// next.config.ts remotePatterns.
const ALLOWED_HOST_SUFFIXES = [
  ".supabase.co",
  ".amazonaws.com", // Printify S3 (pfy-prod-image-storage.s3...)
];
const ALLOWED_HOSTS = new Set([
  "images.printify.com",
  "images-api.printify.com",
  "oaidalleapiprodscus.blob.core.windows.net",
  "placehold.co",
]);

const MAX_BYTES = 15 * 1024 * 1024; // 15MB cap

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
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
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

  try {
    const response = await fetch(remoteUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      redirect: "error", // do not follow redirects into disallowed hosts
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Remote resource is not an image" },
        { status: 400 },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch remote image" }, { status: 500 });
  }
}
