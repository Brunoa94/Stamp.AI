import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";
import { isAccountActionAllowed } from "@/lib/security/accountActionProtection";
import { userHasPasswordIdentity } from "@/lib/account/deletionConfirmation";
import { ChangePasswordRequestSchema } from "@/shared/schemas/account";
import type { Database } from "@/shared/types/database.types";

export const runtime = "nodejs";

/**
 * POST /api/account/password — change the signed-in user's password.
 *
 * A session alone is not enough: an account with a password must re-enter
 * it, so a stolen session cannot lock the owner out. Social sign-in accounts
 * have no password to re-enter and may set one. The new password is written
 * with the service role, because GoTrue's secure_password_change rejects a
 * plain updateUser on sessions older than 24 hours.
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

    const parsed = ChangePasswordRequestSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "SUPABASE_CONFIG_MISSING" }, { status: 500 });
    }

    const supabaseAdmin = createSupabaseClient<Database>(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    if (!(await isAccountActionAllowed(supabaseAdmin, request, "account-password", user.id))) {
      return NextResponse.json({ error: "TOO_MANY_ATTEMPTS" }, { status: 429 });
    }

    if (userHasPasswordIdentity(user)) {
      if (!parsed.data.currentPassword) {
        return NextResponse.json({ error: "CURRENT_PASSWORD_REQUIRED" }, { status: 400 });
      }
      const { error: passwordError } = user.email
        ? await supabaseAdmin.auth.signInWithPassword({
            email: user.email,
            password: parsed.data.currentPassword,
          })
        : { error: new Error("No email on account") };
      if (passwordError) {
        return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 403 });
      }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: parsed.data.newPassword },
    );
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { service: "AccountPasswordAPI", action: "changePassword" });
    return NextResponse.json({ error: "PASSWORD_CHANGE_FAILED" }, { status: 500 });
  }
}
