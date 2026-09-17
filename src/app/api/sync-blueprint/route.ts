import { NextRequest, NextResponse } from "next/server";
import { checkAdminSecret } from "@/lib/security/adminSecret";

export const runtime = "nodejs";

/**
 * Sync Blueprint API Route (operator only)
 *
 * Triggers the sync-blueprint Edge Function to fetch blueprint data
 * (including images and variants) from Printify and update the database.
 * Nothing in the app calls this; it is an operations endpoint, so it requires
 * `Authorization: Bearer <ADMIN_API_SECRET>`.
 *
 * POST /api/sync-blueprint
 * Body: { blueprint_id: number, print_provider_id?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = checkAdminSecret(request);
    if (adminAuth === "unconfigured") {
      return NextResponse.json(
        { error: "ADMIN_API_SECRET is not configured" },
        { status: 503 },
      );
    }
    if (adminAuth === "unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { blueprint_id, print_provider_id } = body;

    if (!Number.isInteger(blueprint_id) || blueprint_id <= 0) {
      return NextResponse.json(
        { error: "blueprint_id is required and must be a positive integer" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 },
      );
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/sync-blueprint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        blueprint_id,
        print_provider_id: print_provider_id || 99,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to sync blueprint" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error syncing blueprint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
