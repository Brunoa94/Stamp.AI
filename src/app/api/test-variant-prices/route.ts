import { NextResponse } from "next/server";
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
    const upperCountry = countryCode.toUpperCase();

    // Get all providers for this blueprint
    const { data: providers, error } = await supabase
      .from("provider_catalog")
      .select("*")
      .eq("blueprint_id", parseInt(blueprintId))
      .gt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching providers:", error);
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
        },
        { status: 500 }
      );
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({
        success: true,
        blueprint_id: parseInt(blueprintId),
        country_code: upperCountry,
        variant_count: 0,
        data: {},
      });
    }

    // Map to track the cheapest option for each variant
    const variantPriceMap = new Map<
      number,
      {
        variant_id: number;
        provider_id: number;
        provider_name: string;
        variant_price: number;
        shipping_cost: number;
        total_cost: number;
      }
    >();

    for (const provider of providers) {
      // Find shipping cost for this country
      let shippingCost: number | null = null;

      for (const profile of provider.shipping_profiles) {
        if (profile.countries.includes(upperCountry)) {
          shippingCost = profile.first_item.cost;
          break;
        }
      }

      // Skip if this provider doesn't ship to the requested country
      if (shippingCost === null) {
        continue;
      }

      // Process all variants for this provider
      for (const variant of provider.variants_data) {
        if (!variant.is_enabled) {
          continue;
        }

        const variantPrice = variant.price;
        const totalCost = variantPrice + shippingCost;

        const existing = variantPriceMap.get(variant.id);

        // Update if this is cheaper or if it's the first entry for this variant
        if (!existing || totalCost < existing.total_cost) {
          variantPriceMap.set(variant.id, {
            variant_id: variant.id,
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            variant_price: variantPrice,
            shipping_cost: shippingCost,
            total_cost: totalCost,
          });
        }
      }
    }

    // Convert Map to object for JSON response
    const result: Record<string, any> = {};
    variantPriceMap.forEach((price, variantId) => {
      result[variantId] = price;
    });

    return NextResponse.json({
      success: true,
      blueprint_id: parseInt(blueprintId),
      country_code: upperCountry,
      variant_count: variantPriceMap.size,
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
