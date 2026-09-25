import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureError } from "@/lib/observability/errorCapture";
import { OpenAIImageService } from "@/shared/services/openaiImageService";

export const runtime = "nodejs";
// Two sequential OpenAI calls (vision + image generation). 60s is within the
// default limit of every Vercel plan; raise together with OPENAI_TIMEOUT_MS if
// the deploy target allows more.
export const maxDuration = 60;

// Mirrors the client-side MAX_FILE_SIZE in useStampImageUpload.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
// Headroom for multipart framing and the small text fields.
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
const MAX_PROMPT_LENGTH = 2000;
// Leave a few seconds under maxDuration so the client gets a real error
// (and the coin is refunded) instead of a platform timeout.
const OPENAI_TIMEOUT_MS = 55_000;

type AcceptedImageMimeType = "image/png" | "image/jpeg" | "image/webp" | "image/gif";

/**
 * Detect the image type from its magic bytes. The client-supplied `File.type`
 * is never trusted — the bytes are what gets forwarded to OpenAI.
 * Returns null for anything that is not a supported raster image.
 */
function detectImageMimeType(bytes: Uint8Array): AcceptedImageMimeType | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
    bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 &&
    bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // GIF87a / GIF89a — accepted because the upload UI allows .gif files.
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
    bytes[3] === 0x38 && (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  return null;
}

async function refundCoin(userId: string): Promise<void> {
  try {
    const { error } = await createServiceClient().rpc("refund_coin", {
      p_user_id: userId,
    });
    if (error) {
      throw new Error(error.message);
    }
  } catch (refundError) {
    // Never mask the original generation error; record the failed refund.
    captureError(refundError, {
      service: "ImageGeneration",
      action: "refundCoin",
    });
    console.error("[generate-image] refund_coin failed for user", userId);
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Authentication ──────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // ── Request size guard (before the multipart body is parsed) ──────────────
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10MB or smaller" },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const promptField = formData.get("prompt");
    const imageField = formData.get("image");
    const preservationStr = formData.get("preservation") as string;
    const preservation = preservationStr ? parseInt(preservationStr, 10) : 50;
    const removeBackgroundStr = formData.get("removeBackground") as string;
    const removeBackground = removeBackgroundStr !== "false";

    const prompt = typeof promptField === "string" ? promptField.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer` },
        { status: 400 },
      );
    }

    if (!(imageField instanceof File)) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 },
      );
    }
    const image = imageField;

    if (image.size === 0) {
      return NextResponse.json(
        { error: "Image file is empty" },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10MB or smaller" },
        { status: 413 },
      );
    }

    // ── Read image data ────────────────────────────────────────────────────────
    const imageBuffer = await image.arrayBuffer();

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Failed to read image data" },
        { status: 400 },
      );
    }

    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10MB or smaller" },
        { status: 413 },
      );
    }

    // ── Determine MIME type from the bytes (never from the client) ────────────
    const mimeType = detectImageMimeType(
      new Uint8Array(imageBuffer, 0, Math.min(12, imageBuffer.byteLength)),
    );

    if (!mimeType) {
      return NextResponse.json(
        { error: "Unsupported image type. Please upload a PNG, JPEG, WebP or GIF." },
        { status: 400 },
      );
    }

    // Never log the raw prompt or the client-supplied filename.
    console.log("[generate-image] request", {
      userId: user.id,
      mimeType,
      imageBytes: imageBuffer.byteLength,
      promptLength: prompt.length,
      preservation,
      removeBackground,
    });

    // ── Coin deduction (server-side, before any paid work) ─────────────────────
    // deduct_coin runs as the caller: the RPC only allows a user to deduct
    // their own coins and is atomic (row lock + daily reset).
    const { data: hasCoin, error: rpcError } = await supabase.rpc(
      "deduct_coin",
      {
        user_id: user.id,
      },
    );

    if (rpcError) {
      console.error("[generate-image] deduct_coin failed:", rpcError.message);
      return NextResponse.json(
        { error: "Failed to process coin deduction" },
        { status: 500 },
      );
    }

    if (!hasCoin) {
      return NextResponse.json(
        { error: "INSUFFICIENT_COINS" },
        { status: 402 },
      );
    }

    let result: Awaited<ReturnType<typeof OpenAIImageService.generateImage>>;
    try {
      result = await OpenAIImageService.generateImage(
        imageBuffer,
        mimeType,
        prompt,
        preservation,
        removeBackground,
        { signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS) },
      );
    } catch (generationError) {
      // The user paid for nothing: give the coin back (service role only).
      await refundCoin(user.id);
      throw generationError;
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      originalPrompt: prompt,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    captureError(err, {
      service: "ImageGeneration",
      action: "generateImage",
    });

    console.error("[generate-image] Error:", err.message, err.stack);

    // Return user-friendly error messages
    let userMessage =
      "We couldn't generate your image right now. Please try again in a moment.";

    if (err.name === "AbortError" || err.name === "TimeoutError") {
      userMessage =
        "Image generation took too long. Please try again in a moment.";
    } else if (err.message?.includes("API key")) {
      userMessage =
        "Image generation service is temporarily unavailable. Please try again later.";
    } else if (
      err.message?.includes("sharp") || err.message?.includes("libvips")
    ) {
      userMessage =
        "Image processing is temporarily unavailable. Please try again later.";
    } else if (err.message?.includes("background-removal")) {
      userMessage =
        "Image processing is temporarily unavailable. Please try again later.";
    } else if (err.message?.includes("OPENAI_API_KEY")) {
      userMessage =
        "Image generation service is not configured. Please contact support.";
    } else if (err.message?.includes("moderation_blocked")) {
      userMessage =
        "Your image or prompt was blocked by content moderation. Please try a different image or prompt.";
    }

    return NextResponse.json(
      {
        error: userMessage,
        // Only include technical details in development
        ...(process.env.NODE_ENV !== "production" && { details: err.message }),
      },
      { status: 500 },
    );
  }
}
