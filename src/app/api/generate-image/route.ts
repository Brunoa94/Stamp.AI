import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GeminiImageService } from "@/services/geminiImageService";

export const runtime = "nodejs";

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

    // // ── Coin deduction ──────────────────────────────────────────────────────────
    // const { data: hasCoin, error: rpcError } = await supabase.rpc(
    //   "deduct_coin",
    //   { user_id: user.id },
    // );

    // if (rpcError) {
    //   console.error("deduct_coin RPC error:", rpcError.message);
    //   return NextResponse.json(
    //     { error: "Failed to process coin deduction" },
    //     { status: 500 },
    //   );
    // }

    // if (!hasCoin) {
    //   return NextResponse.json(
    //     { error: "Not enough coins" },
    //     { status: 402 },
    //   );
    // }

    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const image = formData.get("image") as File;
    const preservationStr = formData.get("preservation") as string;
    const preservation = preservationStr ? parseInt(preservationStr, 10) : 50;
    const removeBackgroundStr = formData.get("removeBackground") as string;
    const removeBackground = removeBackgroundStr !== "false";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // ── Read image data ────────────────────────────────────────────────────────
    console.log("Image info:", { name: image.name, type: image.type, size: image.size });

    if (image.size === 0) {
      return NextResponse.json(
        { error: "Image file is empty" },
        { status: 400 }
      );
    }

    // Read the image bytes
    const imageBytes = await image.bytes();
    const imageBuffer = imageBytes.buffer.slice(
      imageBytes.byteOffset,
      imageBytes.byteOffset + imageBytes.byteLength
    );

    console.log("Image buffer size:", imageBuffer.byteLength);

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Failed to read image data" },
        { status: 400 }
      );
    }

    // ── Determine correct MIME type ────────────────────────────────────────────
    let mimeType = image.type;

    // If MIME type is missing or generic, detect from file signature (magic bytes)
    if (!mimeType || mimeType === "application/octet-stream") {
      const uint8Array = new Uint8Array(imageBuffer).slice(0, 12);

      if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
        mimeType = "image/jpeg";
      } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
        mimeType = "image/png";
      } else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
        mimeType = "image/gif";
      } else if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
                 uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
        mimeType = "image/webp";
      } else {
        // Default to JPEG if we can't detect
        mimeType = "image/jpeg";
      }
      console.log(`Detected MIME type from magic bytes: ${mimeType}`);
    }

    // ── Generate image using Gemini (2.5 Flash + 2.5 Flash Image) ──────────────
    console.log("Generating image with Gemini");
    console.log("Original prompt:", prompt);
    console.log("Preservation level:", preservation);
    console.log("Remove background:", removeBackground);
    console.log("Image file:", image.name, "MIME type:", mimeType);

    const result = await GeminiImageService.generateImage(
      imageBuffer,
      mimeType,
      prompt,
      preservation,
      removeBackground
    );

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      enhancedPrompt: result.enhancedPrompt,
      originalPrompt: prompt
    });

  } catch (error: any) {
    console.error("Image generation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
