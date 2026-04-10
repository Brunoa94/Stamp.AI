import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const selectedStyle = (formData.get("selectedStyle") as string | null) ?? "N/A";
    const preservationRaw = formData.get("preservation") as string | null;
    const parsedPreservation = Number(preservationRaw ?? "80");
    const preservation = Number.isFinite(parsedPreservation)
      ? Math.min(100, Math.max(0, parsedPreservation))
      : 80;

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

    // ── [MOCK] Return a static mockup image instead of calling Gemini ──────────
    console.log("[MOCK] Skipping Gemini image generation, returning mockup image");
    console.log("Original prompt:", prompt);

    return NextResponse.json({
      success: true,
      imageUrl: "https://placehold.co/1024x1024/png",
      enhancedPrompt: `[MOCK] ${prompt}`,
      originalPrompt: prompt,
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
