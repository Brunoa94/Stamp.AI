import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

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

    // MOCK RESPONSE FOR TESTING - Disable OpenAI calls
    console.log("Testing mode - using mock response");
    console.log("Original prompt:", prompt);
    console.log("Image file:", image.name);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock enhanced prompt based on user input
    const enhancedPrompt = `A stunning anime-style transformation inspired by ${prompt}. The image features vibrant colors, dynamic lighting, and detailed character design reminiscent of popular anime series like Naruto. The composition includes dramatic poses, flowing hair and clothing, with a mystical background featuring cherry blossoms or energy auras. The art style emphasizes bold outlines, cel-shading techniques, and expressive facial features typical of Japanese animation.`;

    // Mock image URL (placeholder image)
    const mockImageUrl = "https://picsum.photos/1024/1024?random=" + Date.now();

    return NextResponse.json({
      success: true,
      imageUrl: mockImageUrl,
      enhancedPrompt,
      originalPrompt: prompt
    });

    // ORIGINAL OPENAI CODE (COMMENTED OUT FOR TESTING)
    /*
    // Convert image to base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Use OpenAI Vision API to analyze the image and generate a new image
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and create a detailed DALL-E prompt to generate a new image based on this description: ${prompt}. Make the prompt descriptive and specific, incorporating elements from the original image while applying the requested transformation.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const enhancedPrompt = visionResponse.choices[0]?.message?.content;

    if (!enhancedPrompt) {
      return NextResponse.json(
        { error: "Failed to generate enhanced prompt" },
        { status: 500 }
      );
    }

    // Generate new image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const generatedImageUrl = imageResponse.data?.[0]?.url;

    if (!generatedImageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      enhancedPrompt,
      originalPrompt: prompt
    });
    */

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