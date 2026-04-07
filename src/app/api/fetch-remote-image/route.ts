import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const remoteUrl = request.nextUrl.searchParams.get("url");

  if (!remoteUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(remoteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

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
