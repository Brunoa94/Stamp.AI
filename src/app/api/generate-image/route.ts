import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { captureError } from "@/lib/observability/errorCapture";
import { OpenAIImageService } from "@/shared/services/openaiImageService";
import { withTimeout } from "@/lib/promiseUtils";
import {
  detectImageMimeType,
  MAX_REFERENCE_IMAGE_BYTES,
} from "@/lib/images/imageUpload";

export const runtime = "nodejs";
// Vision + image generation (with the SDK's retries) can take over a minute.
export const maxDuration = 120;

/** Generation is abandoned (and the coin refunded) after this long. */
const GENERATION_DEADLINE_MS = 100_000;

class GenerationTimeoutError extends Error {
  constructor() {
    super("Image generation timed out");
    this.name = "GenerationTimeoutError";
  }
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

    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const image = formData.get("image") as File;
    const preservationStr = formData.get("preservation") as string;
    const preservation = preservationStr ? parseInt(preservationStr, 10) : 50;
    const removeBackgroundStr = formData.get("removeBackground") as string;
    const removeBackground = removeBackgroundStr !== "false";

    // Validate prompt: must exist, not be whitespace-only, and be within length limits
    const MAX_PROMPT_LENGTH = 500;
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and cannot be empty" },
        { status: 400 },
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` },
        { status: 400 },
      );
    }

    // ── Read image data (optional - prompt-only generation is supported) ────────
    let imageBuffer: ArrayBuffer | null = null;
    let mimeType: string | null = null;

    if (image && image.size > 0) {
      if (image.size > MAX_REFERENCE_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "The image is too large. Please upload an image under 10 MB." },
          { status: 413 },
        );
      }

      imageBuffer = await image.arrayBuffer();
      if (imageBuffer.byteLength === 0) {
        return NextResponse.json(
          { error: "Failed to read image data" },
          { status: 400 },
        );
      }

      // The bytes decide the type; the declared MIME type is not trusted.
      mimeType = detectImageMimeType(new Uint8Array(imageBuffer, 0, Math.min(12, imageBuffer.byteLength)));
      if (!mimeType) {
        return NextResponse.json(
          { error: "Unsupported image format. Please upload a PNG, JPEG or WebP image." },
          { status: 415 },
        );
      }
    }

    // ── Generate image using OpenAI (GPT-4o + GPT Image 1) ──────────────────────
    const hasReferenceImage = imageBuffer !== null && mimeType !== null;
    console.log("Generating image with OpenAI");
    console.log("Preservation level:", preservation);
    console.log("Remove background:", removeBackground);
    console.log("Has reference image:", hasReferenceImage);
    if (hasReferenceImage && image) {
      console.log("Image file:", image.name, "MIME type:", mimeType);
    }

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
      const generation = hasReferenceImage
        ? // Generate with reference image (uses vision + image generation)
          OpenAIImageService.generateImage(
            imageBuffer!,
            mimeType!,
            prompt,
            preservation,
            removeBackground,
          )
        : // Generate from prompt only (direct image generation)
          OpenAIImageService.generateFromPrompt(prompt, removeBackground);
      result = await withTimeout(generation, GENERATION_DEADLINE_MS, new GenerationTimeoutError());
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

    if (err instanceof GenerationTimeoutError) {
      return NextResponse.json(
        { error: "Image generation is taking too long. Your coin was refunded; please try again." },
        { status: 504 },
      );
    }
    if (err.message?.includes("moderation_blocked")) {
      return NextResponse.json(
        { error: "Your image or prompt was blocked by content moderation. Please try a different image or prompt." },
        { status: 422 },
      );
    }

    // Return user-friendly error messages; provider errors are never echoed.
    let userMessage =
      "We couldn't generate your image right now. Please try again in a moment.";

    if (err.message?.includes("API key")) {
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
