import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/observability/errorCapture";
import { isAccountActionAllowed } from "@/lib/security/accountActionProtection";
import {
  evaluateDeletionConfirmation,
  userHasPasswordIdentity,
} from "@/lib/account/deletionConfirmation";
import { removeUserInvoicePdfs } from "@/lib/account/invoiceStorageCleanup";
import {
  DeleteAccountRequestSchema,
  DeleteOwnAccountResultSchema,
} from "@/schemas/account";
import type { Database } from "@/types/database.types";

export const runtime = "nodejs";

/**
 * POST /api/account/delete — GDPR right to erasure.
 *
 * 1. Requires a signed-in user, the confirmation phrase and (for password
 *    accounts) the re-entered password.
 * 2. Calls delete_own_account() on the user's own session: refuses with 409
 *    while orders/payments are in flight, otherwise anonymises tax-retained
 *    rows and deletes the rest.
 * 3. With the service role: removes invoice PDFs from storage and deletes the
 *    auth.users row, then signs the session out.
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

    const body = await request.json().catch(() => null);
    const parsed = DeleteAccountRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_REQUEST_BODY" }, { status: 400 });
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
        "account-delete",
        user.id,
      ))
    ) {
      return NextResponse.json(
        { error: "Too many deletion attempts" },
        { status: 429 },
      );
    }

    const decision = evaluateDeletionConfirmation(
      parsed.data,
      userHasPasswordIdentity(user),
    );
    if (!decision.ok) {
      return NextResponse.json({ error: decision.error }, { status: 400 });
    }

    if (decision.verifyPassword) {
      const { error: passwordError } = user.email
        ? await supabaseAdmin.auth.signInWithPassword({
            email: user.email,
            password: parsed.data.password ?? "",
          })
        : { error: new Error("No email on account") };

      if (passwordError) {
        return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 403 });
      }
    }

    const { data, error } = await supabase.rpc("delete_own_account", {
      p_reason: parsed.data.reason,
    });
    if (error) throw error;

    const result = DeleteOwnAccountResultSchema.parse(data);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.reason,
          openOrders: result.open_orders,
          pendingPaymentRecoveries: result.pending_payment_recoveries,
          unresolvedRefunds: result.unresolved_refunds,
        },
        { status: 409 },
      );
    }

    const cleanup = await removeUserInvoicePdfs(
      supabaseAdmin,
      user.id,
      result.invoice_pdfs,
    );
    if (cleanup.failed.length > 0) {
      captureError(
        new Error(`Invoice PDF cleanup failed for ${cleanup.failed.length} object(s)`),
        { service: "AccountDeleteAPI", action: "removeInvoicePdfs" },
        "warning",
      );
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    );
    if (deleteError) throw deleteError;

    // The auth user is gone; clear the session cookies regardless of the
    // server-side sign-out result.
    await supabase.auth.signOut().catch(() => undefined);

    return NextResponse.json({
      success: true,
      retained: {
        orders: result.orders_anonymised,
        invoices: result.invoices_anonymised,
        payments: result.payments_anonymised,
      },
    });
  } catch (error) {
    captureError(error, { service: "AccountDeleteAPI", action: "delete" });
    return NextResponse.json({ error: "ACCOUNT_DELETE_FAILED" }, { status: 500 });
  }
}
