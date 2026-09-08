import { NextRequest, NextResponse } from "next/server";

/**
 * Sync Blueprint API Route
 *
 * Triggers the sync-blueprint Edge Function to fetch blueprint data
 * (including images and variants) from Printify and update the database.
 *
 * POST /api/sync-blueprint
 * Body: { blueprint_id: number, print_provider_id?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint_id, print_provider_id } = body;

    if (!blueprint_id || typeof blueprint_id !== "number") {
      return NextResponse.json(
        { error: "blueprint_id is required and must be a number" },
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

    const response = await fetch(
      `${supabaseUrl}/functions/v1/sync-blueprint`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          blueprint_id,
          print_provider_id: print_provider_id || 99,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to sync blueprint" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error syncing blueprint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
