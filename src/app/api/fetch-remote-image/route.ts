import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { isAllowedImageSource } from "../../../../supabase/functions/_shared/imageSourceRules";
const MAX_BYTES = 15 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);

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

  if (!isAllowedImageSource(remoteUrl, process.env.NEXT_PUBLIC_SUPABASE_URL || "")) {
    return NextResponse.json({ error: "URL host not allowed" }, { status: 400 });
  }

  try {
    const response = await fetch(remoteUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      redirect: "error", // do not follow redirects into disallowed hosts
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!IMAGE_TYPES.has(contentType.split(";")[0].trim().toLowerCase())) {
      return NextResponse.json(
        { error: "Remote resource is not an image" },
        { status: 400 },
      );
    }

    if (Number(response.headers.get("content-length")) > MAX_BYTES) {
      await response.body?.cancel();
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }
    const reader = response.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Empty image" }, { status: 502 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Image too large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const arrayBuffer = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { arrayBuffer.set(chunk, offset); offset += chunk.byteLength; }

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
