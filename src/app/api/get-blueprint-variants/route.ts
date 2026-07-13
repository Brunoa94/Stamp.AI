import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { blueprint_id, print_provider_id = 99 } = await request.json();

    if (!blueprint_id) {
      return NextResponse.json(
        { error: "Blueprint ID is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query product_variants table directly
    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("printify_variant_id, color, size, price_cents, is_available")
      .eq("blueprint_id", blueprint_id)
      .eq("is_available", true)
      .order("color")
      .order("size");

    if (error) {
      console.error("Error fetching variants:", error);
      return NextResponse.json(
        { error: "Failed to fetch variants" },
        { status: 500 }
      );
    }

    // Extract unique colors and sizes
    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();

    const mappedVariants = (variants || []).map((v) => {
      if (v.color && v.color !== "Default") colorsSet.add(v.color);
      if (v.size) sizesSet.add(v.size);

      return {
        id: v.printify_variant_id,
        title: `${v.color || ""} / ${v.size || ""}`.trim(),
        options: {
          color: v.color || undefined,
          size: v.size || undefined,
        },
      };
    });

    // Sort sizes in a logical order
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
    const sortedSizes = Array.from(sizesSet).sort((a, b) => {
      const aIdx = sizeOrder.indexOf(a);
      const bIdx = sizeOrder.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    return NextResponse.json({
      success: true,
      variants: mappedVariants,
      colors: Array.from(colorsSet).sort(),
      sizes: sortedSizes,
      printProviderId: print_provider_id,
    });
  } catch (error) {
    console.error("Error fetching blueprint variants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
