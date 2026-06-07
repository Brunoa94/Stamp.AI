import { NextResponse } from "next/server";
import { ProviderCatalogService } from "@/services/providerCatalogService";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get("blueprint_id");
    const countryCode = searchParams.get("country_code");

    if (!blueprintId || !countryCode) {
      return NextResponse.json(
        {
          error: "Missing required parameters: blueprint_id and country_code",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const variantPrices =
      await ProviderCatalogService.getLowestPricesPerVariant(
        supabase,
        parseInt(blueprintId),
        countryCode
      );

    // Convert Map to object for JSON response
    const result: Record<string, any> = {};
    variantPrices.forEach((price, variantId) => {
      result[variantId] = price;
    });

    return NextResponse.json({
      success: true,
      blueprint_id: parseInt(blueprintId),
      country_code: countryCode.toUpperCase(),
      variant_count: variantPrices.size,
      data: result,
    });
  } catch (error) {
    console.error("Error in test-variant-prices:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
