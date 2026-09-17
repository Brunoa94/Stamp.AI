import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const DEFAULT_PRINT_PROVIDER_ID = 99;
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

function compareSizes(a: string, b: string): number {
  const aIdx = SIZE_ORDER.indexOf(a);
  const bIdx = SIZE_ORDER.indexOf(b);
  if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
  if (aIdx === -1) return 1;
  if (bIdx === -1) return -1;
  return aIdx - bIdx;
}

/**
 * Returns the available variants (colors/sizes) of a catalog blueprint.
 *
 * Reads product_variants through the caller's own session, so the public
 * "available variants" RLS policy applies; no service-role key is involved.
 * Requires a signed-in user because it backs the product customisation flow.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blueprint_id, print_provider_id = DEFAULT_PRINT_PROVIDER_ID } =
      await request.json();

    if (!Number.isInteger(blueprint_id) || blueprint_id <= 0) {
      return NextResponse.json(
        { error: "blueprint_id is required and must be a positive integer" },
        { status: 400 },
      );
    }

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
        { status: 500 },
      );
    }

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

    return NextResponse.json({
      success: true,
      variants: mappedVariants,
      colors: Array.from(colorsSet).sort(),
      sizes: Array.from(sizesSet).sort(compareSizes),
      printProviderId: print_provider_id,
    });
  } catch (error) {
    console.error("Error fetching blueprint variants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
