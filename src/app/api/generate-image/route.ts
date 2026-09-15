import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";
import { detectImageMimeType, MAX_UPLOAD_IMAGE_BYTES } from "@/lib/images/imageUpload";
import { OpenAIImageService } from "@/services/openaiImageService";

export const runtime = "nodejs";

/**
 * Function timeout (seconds).
 *
 * The pipeline is two sequential OpenAI calls — GPT-4o vision analysis
 * (~5–15 s) followed by gpt-image-1-mini generation (~20–60 s) — each of
 * which may be retried once or twice on a transient failure. 120 s covers
 * the slow path with retries; the provider deadline below is shorter so we
 * always answer the client ourselves instead of being killed by the platform.
 */
export const maxDuration = 120;

/** Overall deadline handed to the provider; keeps ~20 s of headroom under maxDuration. */
const GENERATION_DEADLINE_MS = 100_000;

const GENERIC_ERROR_MESSAGE =
  "We couldn't generate your image right now. Please try again in a moment.";

function isTimeoutError(error: Error): boolean {
  return error.name === "TimeoutError" || error.name === "AbortError";
}

/**
 * Map an internal failure to a client-safe status + message.
 * The raw error message is never returned: it is captured server-side only.
 */
function toClientError(error: Error): { status: number; message: string } {
  if (isTimeoutError(error)) {
    return {
      status: 504,
      message: "Image generation took too long. Please try again with a smaller image.",
    };
  }
  if (error.message.includes("moderation_blocked")) {
    return {
      status: 422,
      message:
        "Your image or prompt was blocked by content moderation. Please try a different image or prompt.",
    };
  }
  if (error.message.includes("OPENAI_API_KEY") || error.message.includes("API key")) {
    return {
      status: 503,
      message: "Image generation service is temporarily unavailable. Please try again later.",
    };
  }
  return { status: 500, message: GENERIC_ERROR_MESSAGE };
}

export async function POST(request: NextRequest) {
  try {
    // ── Authentication ──────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Input validation ────────────────────────────────────────────────────────
    const formData = await request.formData();
    const prompt = formData.get("prompt");
    const image = formData.get("image");
    const preservationStr = formData.get("preservation");
    const preservation =
      typeof preservationStr === "string" && preservationStr ? parseInt(preservationStr, 10) : 50;
    const removeBackground = formData.get("removeBackground") !== "false";

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!(image instanceof Blob)) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (image.size === 0) {
      return NextResponse.json({ error: "Image file is empty" }, { status: 400 });
    }

    if (image.size > MAX_UPLOAD_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image must be smaller than ${MAX_UPLOAD_IMAGE_BYTES / (1024 * 1024)} MB` },
        { status: 413 },
      );
    }

    const imageBytes = new Uint8Array(await image.arrayBuffer());

    if (imageBytes.byteLength === 0) {
      return NextResponse.json({ error: "Failed to read image data" }, { status: 400 });
    }

    // Decide the type from the bytes, never from the client-provided header.
    const mimeType = detectImageMimeType(imageBytes);
    if (!mimeType) {
      return NextResponse.json(
        { error: "Unsupported image format. Please upload a PNG, JPEG or WebP file." },
        { status: 415 },
      );
    }

    // ── Generate image using OpenAI (GPT-4o + GPT Image 1) ──────────────────────
    const result = await OpenAIImageService.generateImage(
      imageBytes.buffer as ArrayBuffer,
      mimeType,
      prompt,
      Number.isFinite(preservation) ? preservation : 50,
      removeBackground,
      { signal: AbortSignal.timeout(GENERATION_DEADLINE_MS) },
    );

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      originalPrompt: prompt,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    const errorId = captureError(err, {
      service: "ImageGeneration",
      action: "generateImage",
    });

    console.error("[generate-image] Error:", { errorId, name: err.name, message: err.message });

    const { status, message } = toClientError(err);

    // Only the safe message and a correlation id leave the server.
    return NextResponse.json({ error: message, errorId }, { status });
  }
}
