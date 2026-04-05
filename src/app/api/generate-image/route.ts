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

    // ── Generate image using Gemini (1.5 Flash + Imagen 3) ─────────────────────
    console.log("Generating image with Gemini (1.5 Flash + Imagen 3)");
    console.log("Original prompt:", prompt);
    console.log("Image file:", image.name);

    const imageBuffer = await image.arrayBuffer();

    const result = await GeminiImageService.generateImage(
      imageBuffer,
      image.type,
      prompt
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
