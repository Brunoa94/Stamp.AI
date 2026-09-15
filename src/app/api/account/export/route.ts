import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";
import { isAccountActionAllowed } from "@/lib/security/accountActionProtection";
import type { Database } from "@/types/database.types";

export const runtime = "nodejs";

/**
 * POST /api/account/export — GDPR data portability.
 * Returns everything stored about the signed-in user as a JSON download.
 * The RPC is scoped to auth.uid(), so it runs on the user's own session.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: "SUPABASE_URL_MISSING" }, { status: 500 });
    }
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY_MISSING" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createSupabaseClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    if (
      !(await isAccountActionAllowed(
        supabaseAdmin,
        request,
        "account-export",
        user.id,
      ))
    ) {
      return NextResponse.json(
        { error: "Too many export requests" },
        { status: 429 },
      );
    }

    const { data, error } = await supabase.rpc("export_own_data");
    if (error) throw error;

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="stamp-ai-data-export-${date}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    captureError(error, { service: "AccountExportAPI", action: "export" });
    return NextResponse.json({ error: "ACCOUNT_EXPORT_FAILED" }, { status: 500 });
  }
}
