import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API endpoint to get the best provider for a blueprint and country
 * Selection criteria: Lowest total cost (product price + shipping)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint_id, country_code } = body;

    if (!blueprint_id || !country_code) {
      return NextResponse.json(
        { error: "Missing blueprint_id or country_code" },
        { status: 400 }
      );
    }

    // Validate country code format (2 letters)
    if (typeof country_code !== "string" || country_code.length !== 2) {
      return NextResponse.json(
        { error: "Invalid country_code. Must be 2-letter ISO code (e.g., US, NL, GB)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call database function directly
    const { data, error } = await supabase.rpc(
      "get_best_provider_for_country",
      {
        p_blueprint_id: blueprint_id,
        p_country_code: country_code.toUpperCase(),
      }
    );

    if (error) {
      console.error("Error getting best provider:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No provider found",
          message: `No provider available for blueprint ${blueprint_id} in country ${country_code}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error getting best provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for simple queries via URL params
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const blueprint_id = url.searchParams.get("blueprint_id");
    const country_code = url.searchParams.get("country_code");

    if (!blueprint_id || !country_code) {
      return NextResponse.json(
        { error: "Missing blueprint_id or country_code query parameters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call database function directly
    const { data, error } = await supabase.rpc(
      "get_best_provider_for_country",
      {
        p_blueprint_id: parseInt(blueprint_id),
        p_country_code: country_code.toUpperCase(),
      }
    );

    if (error) {
      console.error("Error getting best provider:", error);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No provider found",
          message: `No provider available for blueprint ${blueprint_id} in country ${country_code}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error("Error getting best provider:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
